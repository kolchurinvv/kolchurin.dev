/**
 * LP / relaxation solver: given a SequencePair + tile metadata + viewport,
 * derive (x, y, w, h) per tile such that:
 *
 *   - H/V precedence from the sequence pair is respected
 *   - Each tile's w ≥ minW, h ≥ minH
 *   - Each tile's aspect ratio stays inside its declared band when possible
 *   - The longest H-critical-path's total width fits inside (viewport.w − margins)
 *   - The wall is 3-sided: left/top anchored at `gutter`, right anchored to viewport;
 *     wall height is OUTPUT, not input
 *
 * Algorithm:
 *   1. Initialize each tile's (w, h) from a tier-weighted area target, clamped
 *      to (minW, minH) and the aspect band.
 *   2. Compute longest-path x's and y's from the sequence pair's H/V edges.
 *   3. If the H-critical-path overflows the viewport, shrink widths in the
 *      violating path uniformly (recomputing heights to keep aspect within band),
 *      repeat up to MAX_ITERATIONS.
 *   4. Report `feasible = false` if any tile still violates minW / minH /
 *      aspect band, or if width overflow can't be resolved.
 *
 * Target perf: N=14 ≤ 3 ms (single-digit ms on a laptop).
 */

import type { SequencePair } from "./sequence-pair"
import type { Position, TileMeta, Tier, Viewport } from "./types"

export interface LPResult {
  positions: Position[]
  totalHeight: number
  feasible: boolean
  violations: Array<{ id: string; kind: "minW" | "minH" | "aspect" | "widthOverflow" }>
}

const MAX_ITERATIONS = 8
const TIER_AREA_WEIGHT: Record<Tier, number> = {
  primary: 4.0,
  secondary: 1.8,
  tertiary: 1.0,
  quaternary: 0.35,
}
// When a content-fitted prefW/prefH is available, the tile is sized to its
// content rather than a viewport share. Tier only nudges the linear scale, so
// the terminal still reads as primary without re-inflating light tiles.
const TIER_PREF_SCALE: Record<Tier, number> = {
  primary: 1.35,
  secondary: 1.12,
  tertiary: 1.0,
  quaternary: 0.95,
}

export function lpSolve(
  sp: SequencePair,
  tiles: readonly TileMeta[],
  viewport: Viewport,
  gutter: number
): LPResult {
  if (tiles.length === 0) {
    return { positions: [], totalHeight: 0, feasible: true, violations: [] }
  }

  const tileById = new Map<string, TileMeta>(tiles.map((t) => [t.id, t]))
  const W = viewport.w
  const innerW = W - 2 * gutter

  // ── Step 1: initialize w, h per tile from tier-weighted targets ───────
  const w = new Map<string, number>()
  const h = new Map<string, number>()

  // Per-tile target size. Prefer the measured content box (prefW/prefH) so tiles
  // are sized to content; fall back to a tier-weighted viewport-area share only
  // when no measurement is available (e.g. SSR, or tests using raw inventory).
  const totalWeight = tiles.reduce((s, t) => s + TIER_AREA_WEIGHT[t.priority], 0)
  const estimatedTotalArea = W * viewport.h
  for (const t of tiles) {
    let tw: number
    let th: number
    if (t.prefW != null && t.prefH != null) {
      const s = TIER_PREF_SCALE[t.priority]
      tw = t.prefW * s
      th = t.prefH * s
    } else {
      const share = TIER_AREA_WEIGHT[t.priority] / totalWeight
      const targetArea = estimatedTotalArea * share
      const ideal = t.aspectRatio?.ideal ?? 1
      tw = Math.sqrt(targetArea * ideal)
      th = Math.sqrt(targetArea / ideal)
    }
    ;[tw, th] = clampToConstraints(tw, th, t)
    w.set(t.id, tw)
    h.set(t.id, th)
  }

  // ── Step 2: longest-path coords; iterate to resolve width overflow ───
  let xs = new Map<string, number>()
  let ys = new Map<string, number>()
  let lastViolatedPath: string[] = []
  let feasible = true
  const violations: LPResult["violations"] = []

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    xs = longestPath(sp.gammaPlus, sp.horizontalEdges(), w, gutter)
    const maxRight = Math.max(...Array.from(xs.entries(), ([id, x]) => x + (w.get(id) ?? 0)))
    const overflow = maxRight + gutter - W

    if (overflow <= 0.5) break // fits

    // Find the critical path that drives maxRight, shrink widths along it.
    lastViolatedPath = findCriticalPath(sp, w, gutter, "horizontal")
    const pathWidth = lastViolatedPath.reduce((s, id) => s + (w.get(id) ?? 0), 0)
    const targetPathWidth = innerW - gutter * (lastViolatedPath.length - 1)
    if (targetPathWidth <= 0) {
      feasible = false
      for (const id of lastViolatedPath) violations.push({ id, kind: "widthOverflow" })
      break
    }
    const scale = targetPathWidth / pathWidth
    if (scale >= 0.999) break // already fits within tolerance

    for (const id of lastViolatedPath) {
      const tile = tileById.get(id)
      if (!tile) continue
      const newW = (w.get(id) ?? 0) * scale
      const newH = h.get(id) ?? 0
      const [cw, ch] = clampToConstraints(newW, newH, tile, { lockHeight: false })
      w.set(id, cw)
      h.set(id, ch)
    }
  }

  // Final longest-path solve
  xs = longestPath(sp.gammaPlus, sp.horizontalEdges(), w, gutter)
  ys = longestPath(sp.gammaPlus, sp.verticalEdges(), h, gutter)

  // ── Step 3: feasibility report ────────────────────────────────────────
  const finalMaxRight = Math.max(...Array.from(xs.entries(), ([id, x]) => x + (w.get(id) ?? 0)))
  if (finalMaxRight + gutter > W + 0.5) {
    feasible = false
    for (const id of lastViolatedPath) violations.push({ id, kind: "widthOverflow" })
  }
  for (const t of tiles) {
    const tw = w.get(t.id) ?? 0
    const th = h.get(t.id) ?? 0
    if (tw + 0.5 < t.minW) {
      feasible = false
      violations.push({ id: t.id, kind: "minW" })
    }
    if (th + 0.5 < t.minH) {
      feasible = false
      violations.push({ id: t.id, kind: "minH" })
    }
    if (t.aspectRatio) {
      const r = tw / Math.max(1e-6, th)
      if (r + 1e-3 < t.aspectRatio.min || r > t.aspectRatio.max + 1e-3) {
        violations.push({ id: t.id, kind: "aspect" })
        // aspect band is SOFT — does not flip feasible
      }
    }
  }

  // ── Step 4: emit positions, total height ──────────────────────────────
  const positions: Position[] = tiles.map((t) => ({
    id: t.id,
    x: xs.get(t.id) ?? 0,
    y: ys.get(t.id) ?? 0,
    w: w.get(t.id) ?? 0,
    h: h.get(t.id) ?? 0,
  }))
  const totalHeight = Math.max(0, ...positions.map((p) => p.y + p.h)) + gutter

  return { positions, totalHeight, feasible, violations }
}

/**
 * Slack-absorption pass — RENDER ONLY. The longest-path solve places every tile
 * at its target size, which leaves whitespace between neighbours (the "floating
 * pebbles" look). This grows each tile rightward into the gap up to its nearest
 * right-neighbour (or the viewport edge), then downward up to its nearest
 * below-neighbour, turning the placement into a gap-free wall.
 *
 * Growth respects the aspect band for normal tiles; `fill`-placement tiles
 * (certs, footer) grow freely to mop up leftover space. The bottom edge is left
 * open (3-sided box): bottom-most tiles are NOT stretched to a common floor, so
 * the wall stays naturally ragged at the scroll edge.
 *
 * Kept OUT of `lpSolve` on purpose: the annealer's cost (notably `deadSpace`)
 * must see the raw, un-absorbed positions so it optimises real topological
 * compactness rather than post-fill cosmetics.
 */
export function absorbSlack(
  positions: readonly Position[],
  tiles: readonly TileMeta[],
  viewport: Viewport,
  gutter: number
): { positions: Position[]; totalHeight: number } {
  const tileById = new Map<string, TileMeta>(tiles.map((t) => [t.id, t]))
  const innerRight = viewport.w - gutter
  const EPS = 0.5

  // Work on a mutable copy; the right/down probes read a frozen snapshot so
  // one tile's growth never feeds back into another's limit within a pass.
  const out: Position[] = positions.map((p) => ({ ...p }))

  // ── Pass 1: grow widths rightward ──────────────────────────────────────
  const beforeW = out.map((p) => ({ ...p }))
  for (const p of out) {
    const t = tileById.get(p.id)
    let limit = innerRight
    for (const q of beforeW) {
      if (q.id === p.id) continue
      const toTheRight = q.x >= p.x + p.w - EPS
      const vOverlap = q.y < p.y + p.h - EPS && q.y + q.h > p.y + EPS
      if (toTheRight && vOverlap) limit = Math.min(limit, q.x - gutter)
    }
    let newW = Math.max(p.w, limit - p.x)
    // Cap growth at the reasonable max: rich tiles grow to fill the available
    // width (fill beats the aspect band here, by design), pebbles barely move.
    // Fall back to the aspect band only when no measured max is present (tests).
    let wCap = t?.maxW ?? (t?.aspectRatio ? t.aspectRatio.max * p.h : undefined)
    // Render-time, viewport-relative cap: a rich (non-pebble) tile may not absorb
    // past ~half the width, or a narrow screen collapses to a single column.
    // Lives here (per actual width) so measurement stays viewport-independent.
    if (t?.placement == null) {
      const halfW = viewport.w * 0.5
      wCap = wCap == null ? halfW : Math.min(wCap, halfW)
    }
    if (wCap != null) newW = Math.min(newW, wCap)
    p.w = Math.max(p.w, newW)
  }

  // ── Pass 2: grow heights downward (uses post-width horizontal overlap) ──
  const afterW = out.map((p) => ({ ...p }))
  for (const p of out) {
    const t = tileById.get(p.id)
    let limit = Number.POSITIVE_INFINITY
    for (const q of afterW) {
      if (q.id === p.id) continue
      const below = q.y >= p.y + p.h - EPS
      const hOverlap = q.x < p.x + p.w - EPS && q.x + q.w > p.x + EPS
      if (below && hOverlap) limit = Math.min(limit, q.y - gutter)
    }
    if (Number.isFinite(limit)) {
      let newH = Math.max(p.h, limit - p.y)
      // Height growth is largely cosmetic — the main-thread re-fit pass sets the
      // final height to the content at the packed width — but still cap it at the
      // reasonable max so the intermediate stays sane.
      const hCap = t?.maxH ?? (t?.aspectRatio ? p.w / t.aspectRatio.min : undefined)
      if (hCap != null) newH = Math.min(newH, hCap)
      p.h = Math.max(p.h, newH)
    }
    // limit === Infinity ⇒ bottom-most in its column ⇒ leave height as-is.
  }

  const totalHeight = Math.max(0, ...out.map((p) => p.y + p.h)) + gutter
  return { positions: out, totalHeight }
}

// ──────────────────────────────────────────────────────────────────────
// helpers
// ──────────────────────────────────────────────────────────────────────

function clampToConstraints(
  w: number,
  h: number,
  t: TileMeta,
  opts: { lockHeight?: boolean } = {}
): [number, number] {
  let cw = Math.max(t.minW, w)
  let ch = Math.max(t.minH, h)
  const band = t.aspectRatio
  if (band) {
    const r = cw / Math.max(1e-6, ch)
    if (r < band.min) {
      if (opts.lockHeight) cw = band.min * ch
      else ch = cw / band.min
    } else if (r > band.max) {
      if (opts.lockHeight) cw = band.max * ch
      else ch = cw / band.max
    }
    // re-clamp to mins
    cw = Math.max(t.minW, cw)
    ch = Math.max(t.minH, ch)
  }
  return [cw, ch]
}

/**
 * Topological longest-path from each tile to compute x (using H edges) or
 * y (using V edges). Edge a→b means b's coordinate ≥ a's coordinate + size(a) + gutter.
 */
export function longestPath(
  allIds: readonly string[],
  edges: ReadonlyArray<[string, string]>,
  size: Map<string, number>,
  gutter: number
): Map<string, number> {
  const preds = new Map<string, string[]>()
  for (const id of allIds) preds.set(id, [])
  for (const [a, b] of edges) preds.get(b)?.push(a)

  // Topological order: a node comes after all its predecessors.
  // For sequence-pair derived DAGs this is acyclic by construction.
  const order = topoSort(allIds, edges)
  const pos = new Map<string, number>()
  for (const id of order) {
    const ps = preds.get(id) ?? []
    let best = gutter
    for (const p of ps) {
      const candidate = (pos.get(p) ?? 0) + (size.get(p) ?? 0) + gutter
      if (candidate > best) best = candidate
    }
    pos.set(id, best)
  }
  return pos
}

function topoSort(
  allIds: readonly string[],
  edges: ReadonlyArray<[string, string]>
): string[] {
  const indeg = new Map<string, number>()
  const succ = new Map<string, string[]>()
  for (const id of allIds) {
    indeg.set(id, 0)
    succ.set(id, [])
  }
  for (const [a, b] of edges) {
    succ.get(a)?.push(b)
    indeg.set(b, (indeg.get(b) ?? 0) + 1)
  }
  const queue: string[] = []
  for (const id of allIds) if ((indeg.get(id) ?? 0) === 0) queue.push(id)
  const out: string[] = []
  while (queue.length > 0) {
    const cur = queue.shift()
    if (!cur) continue
    out.push(cur)
    for (const nxt of succ.get(cur) ?? []) {
      const d = (indeg.get(nxt) ?? 0) - 1
      indeg.set(nxt, d)
      if (d === 0) queue.push(nxt)
    }
  }
  return out
}

/**
 * Find the longest-weight path through the H or V DAG.
 * Used to identify which tiles to shrink when overflow occurs.
 */
function findCriticalPath(
  sp: SequencePair,
  size: Map<string, number>,
  gutter: number,
  axis: "horizontal" | "vertical"
): string[] {
  const edges = axis === "horizontal" ? sp.horizontalEdges() : sp.verticalEdges()
  const preds = new Map<string, string[]>()
  for (const id of sp.gammaPlus) preds.set(id, [])
  for (const [a, b] of edges) preds.get(b)?.push(a)

  const order = topoSort(sp.gammaPlus, edges)
  const best = new Map<string, number>()
  const parent = new Map<string, string | null>()
  for (const id of order) {
    let b = (size.get(id) ?? 0) + gutter
    let p: string | null = null
    for (const a of preds.get(id) ?? []) {
      const cand = (best.get(a) ?? 0) + (size.get(id) ?? 0) + gutter
      if (cand > b) {
        b = cand
        p = a
      }
    }
    best.set(id, b)
    parent.set(id, p)
  }

  // Endpoint = node with max best
  let endpoint = order[0]
  let maxBest = -Infinity
  for (const id of order) {
    const bi = best.get(id) ?? 0
    if (bi > maxBest) {
      maxBest = bi
      endpoint = id
    }
  }
  const path: string[] = []
  let cur: string | null = endpoint
  while (cur) {
    path.unshift(cur)
    cur = parent.get(cur) ?? null
  }
  return path
}
