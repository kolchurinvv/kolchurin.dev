/**
 * Cost function: weighted sum of independently-testable terms.
 * Each term is a pure function of (positions, tiles, …) returning a non-negative
 * scalar that the annealer minimizes. Negative-return convention is reserved
 * for "rewards" (variance terms) — see comments.
 */

import type { CostWeights } from "./cost-weights"
import type { SequencePair } from "./sequence-pair"
import type {
  AdjacencyHint,
  GazePoint,
  Position,
  Tier,
  TileMeta,
  Viewport,
} from "./types"

// ──────────────────────────────────────────────────────────────────────
// utilities
// ──────────────────────────────────────────────────────────────────────

const SECONDARY_OR_HIGHER: ReadonlySet<Tier> = new Set(["primary", "secondary"])
const TERTIARY_OR_HIGHER: ReadonlySet<Tier> = new Set(["primary", "secondary", "tertiary"])

function byId(tiles: readonly TileMeta[]): Map<string, TileMeta> {
  return new Map(tiles.map((t) => [t.id, t]))
}

function posById(positions: readonly Position[]): Map<string, Position> {
  return new Map(positions.map((p) => [p.id, p]))
}

function rectOverlap(a: Position, b: Position): number {
  const dx = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x))
  const dy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y))
  return dx * dy
}

function centroid(p: Position): { x: number; y: number } {
  return { x: p.x + p.w / 2, y: p.y + p.h / 2 }
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

// Fuzzy shape categorization. Returns three memberships summing to ~1.
function shapeMemberships(aspect: number): { wide: number; tall: number; square: number } {
  const k = 8
  const wide = sigmoid(k * (aspect - 1.4))
  const tall = sigmoid(k * (0.7 - aspect))
  const square = Math.max(0, 1 - wide - tall)
  return { wide, tall, square }
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

function sameCluster(a: TileMeta, b: TileMeta): boolean {
  return a.cluster != null && b.cluster != null && a.cluster === b.cluster
}

// ──────────────────────────────────────────────────────────────────────
// hard-ish terms (should generally read ≈ 0 post-LP)
// ──────────────────────────────────────────────────────────────────────

export function costOverlap(positions: readonly Position[]): number {
  let acc = 0
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      acc += rectOverlap(positions[i], positions[j])
    }
  }
  return acc
}

export function costWidthOverflow(positions: readonly Position[], viewport: Viewport): number {
  const maxRight = Math.max(0, ...positions.map((p) => p.x + p.w))
  const over = maxRight - viewport.w
  return over > 0 ? over * over : 0
}

export function costSubMin(positions: readonly Position[], tiles: readonly TileMeta[]): number {
  const byMap = byId(tiles)
  let acc = 0
  for (const p of positions) {
    const t = byMap.get(p.id)
    if (!t) continue
    if (p.w < t.minW) acc += (t.minW - p.w) ** 2
    if (p.h < t.minH) acc += (t.minH - p.h) ** 2
  }
  return acc
}

// ──────────────────────────────────────────────────────────────────────
// soft terms
// ──────────────────────────────────────────────────────────────────────

export function costAspectBand(
  positions: readonly Position[],
  tiles: readonly TileMeta[]
): number {
  const byMap = byId(tiles)
  let acc = 0
  for (const p of positions) {
    const t = byMap.get(p.id)
    if (!t || !t.aspectRatio || p.h <= 0) continue
    const r = p.w / p.h
    const { min, ideal, max } = t.aspectRatio
    if (r < min) acc += (min - r) ** 2
    else if (r > max) acc += (r - max) ** 2
    else {
      // inside band — small linear pull toward ideal
      acc += 0.05 * Math.abs(r - ideal)
    }
  }
  return acc
}

/**
 * Reward (return ≤ 0) if a tile's external neighborhood spans multiple tiers.
 * Penalty (≥ 0) if a tile is surrounded by same-tier neighbors.
 */
export function costSizeVariance(
  positions: readonly Position[],
  tiles: readonly TileMeta[],
  sp: SequencePair
): number {
  const byMap = byId(tiles)
  const neighbors = sp.neighbors()
  let acc = 0
  for (const t of tiles) {
    const ns = neighbors.get(t.id) ?? new Set()
    const external = [...ns].filter((nid) => {
      const n = byMap.get(nid)
      return n && !sameCluster(t, n)
    })
    if (external.length === 0) continue
    const tiers = new Set<Tier>([t.priority])
    for (const nid of external) {
      const n = byMap.get(nid)
      if (n) tiers.add(n.priority)
    }
    // Score: 0 if all same tier, scales toward -1 for full variety.
    // Reward of -(distinct−1) * 0.5
    acc += -(tiers.size - 1) * 0.5
  }
  return acc
}

/**
 * Reward neighborhoods of mixed shape categories.
 * Same intra-cluster-skip rule as costSizeVariance.
 */
export function costShapeVariance(
  positions: readonly Position[],
  tiles: readonly TileMeta[],
  sp: SequencePair
): number {
  const tileMap = byId(tiles)
  const posMap = posById(positions)
  const neighbors = sp.neighbors()

  // Dominant shape per tile
  const shape = new Map<string, "wide" | "tall" | "square">()
  for (const p of positions) {
    if (p.h <= 0) continue
    const m = shapeMemberships(p.w / p.h)
    let best: "wide" | "tall" | "square" = "square"
    let bestVal = m.square
    if (m.wide > bestVal) {
      best = "wide"
      bestVal = m.wide
    }
    if (m.tall > bestVal) {
      best = "tall"
      bestVal = m.tall
    }
    shape.set(p.id, best)
  }

  let acc = 0
  for (const p of positions) {
    const me = shape.get(p.id)
    if (!me) continue
    const meTile = tileMap.get(p.id)
    const ns = neighbors.get(p.id) ?? new Set()
    const external = [...ns].filter((nid) => {
      const n = tileMap.get(nid)
      return n && meTile && !sameCluster(meTile, n) && posMap.has(nid)
    })
    if (external.length === 0) continue
    let same = 0
    for (const nid of external) if (shape.get(nid) === me) same++
    const f = same / external.length
    // f ≤ 0.5 → fine; f > 0.5 → penalty proportional to excess.
    if (f > 0.5) acc += (f - 0.5) ** 2
  }
  return acc
}

/**
 * Cluster cohesion = members form ONE edge-adjacent group whose bounding box
 * stays compact. This deliberately rewards CONNECTIVITY + COMPACTNESS rather
 * than a minimal centroid spread, so a cluster is free to take any tight shape —
 * 2×2, a 1×4 row, an L, a T — and fill voids, instead of being forced into a
 * blob. Scattered or snaking arrangements are still penalised.
 */
export function costCluster(
  positions: readonly Position[],
  tiles: readonly TileMeta[],
  gutter = 12
): number {
  const posMap = posById(positions)
  const clusters = new Map<string, TileMeta[]>()
  for (const t of tiles) {
    if (!t.cluster) continue
    if (!clusters.has(t.cluster)) clusters.set(t.cluster, [])
    clusters.get(t.cluster)?.push(t)
  }
  // Members are "adjacent" if their gap is around the gutter (not exactly 0 —
  // tiles are always gutter-separated). 1.8× gutter gives a little slack.
  const tol = gutter * 1.8
  let acc = 0
  for (const [, members] of clusters) {
    if (members.length < 2) continue
    const ps = members.map((m) => posMap.get(m.id)).filter((p): p is Position => p != null)
    if (ps.length < 2) continue

    // 1. Connectivity — every member should neighbour the group. Strays cost
    //    quadratically (one tile drifting off is the worst failure mode).
    const disconnected = countDisconnected(ps, tol)
    acc += disconnected * disconnected * 4

    // 2. Compactness — the cluster's bounding box shouldn't be much larger than
    //    the area its members actually cover. Line/L/T/square all stay ≲ 1.7×;
    //    a sprawling or snaking chain blows past it.
    const sumArea = ps.reduce((s, p) => s + p.w * p.h, 0)
    const minX = Math.min(...ps.map((p) => p.x))
    const minY = Math.min(...ps.map((p) => p.y))
    const maxX = Math.max(...ps.map((p) => p.x + p.w))
    const maxY = Math.max(...ps.map((p) => p.y + p.h))
    const bboxArea = (maxX - minX) * (maxY - minY)
    const ratio = sumArea > 0 ? bboxArea / sumArea : 1
    if (ratio > 1.7) acc += (ratio - 1.7) ** 2
  }
  return acc
}

/** Two tiles neighbour each other if they overlap on one axis and their gap on
 *  the other axis is within `tol` (≈ a gutter). */
function clusterAdjacent(a: Position, b: Position, tol: number): boolean {
  const xOverlap = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
  const yOverlap = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
  const xGap = Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w)
  const yGap = Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h)
  if (yOverlap > 4 && xGap >= -2 && xGap <= tol) return true // side by side
  if (xOverlap > 4 && yGap >= -2 && yGap <= tol) return true // stacked
  return false
}

/**
 * Number of cluster members NOT in the largest connected component, where
 * "connected" means gutter-adjacent (0 ⇒ the whole cluster is one shape).
 */
function countDisconnected(ps: readonly Position[], tol: number): number {
  const n = ps.length
  const adj: number[][] = ps.map(() => [])
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (clusterAdjacent(ps[i], ps[j], tol)) {
        adj[i].push(j)
        adj[j].push(i)
      }
    }
  }
  const seen = new Array<boolean>(n).fill(false)
  let largest = 0
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue
    let size = 0
    const stack = [s]
    seen[s] = true
    while (stack.length > 0) {
      const u = stack.pop()
      if (u === undefined) break
      size++
      for (const v of adj[u]) {
        if (!seen[v]) {
          seen[v] = true
          stack.push(v)
        }
      }
    }
    largest = Math.max(largest, size)
  }
  return n - largest
}

/**
 * For each adjacency hint (a, b, weight): penalty proportional to weight ×
 * (1 - sharedEdgeFraction). sharedEdgeFraction is the length of any shared
 * boundary divided by the smaller tile's perimeter.
 */
export function costAdjacency(
  positions: readonly Position[],
  adjacency: readonly AdjacencyHint[]
): number {
  const posMap = posById(positions)
  let acc = 0
  for (const hint of adjacency) {
    const a = posMap.get(hint.a)
    const b = posMap.get(hint.b)
    if (!a || !b) continue
    const shared = sharedEdgeLength(a, b)
    const minPerim = 2 * Math.min(a.w + a.h, b.w + b.h)
    const frac = minPerim > 0 ? shared / minPerim : 0
    acc += hint.weight * (1 - clamp01(frac))
  }
  return acc
}

function sharedEdgeLength(a: Position, b: Position): number {
  // Touching vertically (left/right edge of one = right/left edge of other)
  // and overlapping in y-range:
  let len = 0
  const xTouch =
    Math.abs(a.x + a.w - b.x) < 1.5 || Math.abs(b.x + b.w - a.x) < 1.5
  const yTouch =
    Math.abs(a.y + a.h - b.y) < 1.5 || Math.abs(b.y + b.h - a.y) < 1.5
  if (xTouch) {
    const yOverlap = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y))
    len += yOverlap
  }
  if (yTouch) {
    const xOverlap = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x))
    len += xOverlap
  }
  return len
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x))
}

/**
 * Pull the centroid of the `primary` tile toward the gaze point.
 * Zero if no primary tile is present.
 */
export function costGaze(
  positions: readonly Position[],
  tiles: readonly TileMeta[],
  gaze: GazePoint
): number {
  const tileMap = byId(tiles)
  const primary = positions.find((p) => tileMap.get(p.id)?.priority === "primary")
  if (!primary) return 0
  const d = distance(centroid(primary), gaze)
  return d * d
}

/**
 * Divide the wall into a 2 × ceil(H / W) grid of cells; penalize each cell
 * that contains no tertiary-or-higher tile centroid. Prevents "all big tiles
 * at the top, only quaternary pebbles below the fold" stratification.
 */
export function costAnchorRecurrence(
  positions: readonly Position[],
  tiles: readonly TileMeta[],
  viewport: Viewport
): number {
  const tileMap = byId(tiles)
  if (positions.length === 0) return 0
  const wallH = Math.max(viewport.h, ...positions.map((p) => p.y + p.h))
  const cellW = viewport.w / 2
  const cellH = Math.max(viewport.h / 2, 200) // never tinier than 200px tall cells
  const rows = Math.max(1, Math.ceil(wallH / cellH))
  const grid: boolean[][] = Array.from({ length: rows }, () => [false, false])
  for (const p of positions) {
    const t = tileMap.get(p.id)
    if (!t || !TERTIARY_OR_HIGHER.has(t.priority)) continue
    const c = centroid(p)
    const col = Math.min(1, Math.max(0, Math.floor(c.x / cellW)))
    const row = Math.min(rows - 1, Math.max(0, Math.floor(c.y / cellH)))
    grid[row][col] = true
  }
  let empty = 0
  for (const row of grid) {
    for (const filled of row) if (!filled) empty++
  }
  return empty * empty
}

/**
 * Compactness / dead-space pressure. Returns the fraction of the wall's
 * bounding area NOT covered by tiles (0 = perfect tessellation, →1 = mostly
 * whitespace). Without this term the annealer has no incentive to keep the
 * wall tight, so low-priority tiles sink to the bottom of a tall chain and
 * leave large empty regions. Evaluated on RAW (pre-slack-absorption) positions
 * so it measures genuine topological compactness, not post-fill cosmetics.
 */
export function costDeadSpace(
  positions: readonly Position[],
  viewport: Viewport
): number {
  if (positions.length === 0) return 0
  const wallBottom = Math.max(0, ...positions.map((p) => p.y + p.h))
  const wallArea = viewport.w * wallBottom
  if (wallArea <= 0) return 0
  let tileArea = 0
  for (const p of positions) tileArea += Math.max(0, p.w) * Math.max(0, p.h)
  return Math.max(0, Math.min(1, (wallArea - tileArea) / wallArea))
}

/**
 * Primary + secondary tiles must satisfy `y + h ≤ viewport.h`.
 * Quadratic penalty over the overshoot, summed per tile.
 */
export function costAboveFold(
  positions: readonly Position[],
  tiles: readonly TileMeta[],
  viewport: Viewport
): number {
  const tileMap = byId(tiles)
  let acc = 0
  for (const p of positions) {
    const t = tileMap.get(p.id)
    // Primary/secondary AND `feature` pebbles (the status badge) want to stay
    // above the fold — without this the badge sinks to the very bottom.
    if (!t || !(SECONDARY_OR_HIGHER.has(t.priority) || t.placement === "feature")) continue
    const overshoot = p.y + p.h - viewport.h
    if (overshoot > 0) acc += overshoot * overshoot
  }
  return acc
}

// ──────────────────────────────────────────────────────────────────────
// aggregator
// ──────────────────────────────────────────────────────────────────────

export interface CostInputs {
  positions: readonly Position[]
  tiles: readonly TileMeta[]
  sp: SequencePair
  adjacency: readonly AdjacencyHint[]
  viewport: Viewport
  gaze: GazePoint
  gutter?: number
}

export interface CostResult {
  total: number
  breakdown: Record<keyof CostWeights, number>
}

export function costFn(inputs: CostInputs, weights: CostWeights): CostResult {
  const breakdown: Record<keyof CostWeights, number> = {
    overlap: costOverlap(inputs.positions),
    widthOverflow: costWidthOverflow(inputs.positions, inputs.viewport),
    subMin: costSubMin(inputs.positions, inputs.tiles),
    aspectBand: costAspectBand(inputs.positions, inputs.tiles),
    cluster: costCluster(inputs.positions, inputs.tiles, inputs.gutter ?? 12),
    adjacency: costAdjacency(inputs.positions, inputs.adjacency),
    sizeVariance: costSizeVariance(inputs.positions, inputs.tiles, inputs.sp),
    shapeVariance: costShapeVariance(inputs.positions, inputs.tiles, inputs.sp),
    gaze: costGaze(inputs.positions, inputs.tiles, inputs.gaze),
    anchorRecurrence: costAnchorRecurrence(inputs.positions, inputs.tiles, inputs.viewport),
    aboveFold: costAboveFold(inputs.positions, inputs.tiles, inputs.viewport),
    deadSpace: costDeadSpace(inputs.positions, inputs.viewport),
  }
  let total = 0
  for (const k of Object.keys(breakdown) as Array<keyof CostWeights>) {
    total += weights[k] * breakdown[k]
  }
  return { total, breakdown }
}
