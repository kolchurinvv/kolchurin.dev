/**
 * Skyline packer with elastic clusters.
 *
 * Width → many FINE columns. Each tile spans 1+ columns and drops into the
 * column-range with the lowest top (bottom-left / skyline fill), so tiles nestle
 * into voids — an organic, non-grid, tessellated wall.
 *
 * A cluster is a cohesive GROUP that occupies `cols` adjacent columns, but its
 * sub-columns nestle INDEPENDENTLY: each sub-column's stack starts at that
 * column's own skyline top. So the cluster stays together (adjacent columns) yet
 * a member can rise into the gap above its column while a sibling stays low —
 * the "elastic rope" stretch, realized deterministically. Tight, fast.
 */
import type { Position, TileMeta } from "./types"

// ── tunable ──────────────────────────────────────────────────────────────────
const COL_TARGET = 420 // coarse columns keep the overall pack balanced/tight
const MAX_COLS = 4
// How far a cluster's sub-columns may stagger (the elastic rope's max stretch).
// They nestle into their own gaps up to this, then stay together. THE knob.
const CLUSTER_STRETCH = 220
const TIER_RANK: Record<string, number> = { primary: 0, secondary: 1, tertiary: 2, quaternary: 3 }
// columns each cluster spans (members masonry-distributed across them)
const CLUSTER_COLS: Record<string, number> = { skills: 2, projects: 1 }

interface Cell {
  id: string
  h: number
}
type Unit =
  | { kind: "tile"; id: string; span: number; w: number; h: number; rank: number; order: number }
  | { kind: "cluster"; cols: number; columns: Cell[][]; rank: number; order: number }

export interface ConstructiveInput {
  tiles: readonly TileMeta[]
  viewport: { w: number; h: number }
  gutter: number
  contentHeight: (id: string, width: number) => number
}

export function constructivePack(input: ConstructiveInput): {
  positions: Position[]
  totalHeight: number
} {
  const { tiles, viewport, gutter, contentHeight } = input
  if (tiles.length === 0) return { positions: [], totalHeight: gutter }

  const availW = Math.max(COL_TARGET, viewport.w - 2 * gutter)
  const N = Math.max(2, Math.min(MAX_COLS, Math.round(availW / COL_TARGET)))
  const colW = Math.floor((availW - (N - 1) * gutter) / N)
  const colX = (c: number) => gutter + c * (colW + gutter)
  const spanWidth = (s: number) => s * colW + (s - 1) * gutter

  const orderOf = new Map(tiles.map((t, i) => [t.id, i]))
  const rankOf = (t: TileMeta): number =>
    t.placement === "feature" ? TIER_RANK.secondary : (TIER_RANK[t.priority] ?? 2)
  const spanOf = (t: TileMeta): number => {
    if (t.id === "footer") return Math.min(N, 4)
    let s = Math.max(1, Math.min(MAX_COLS, N, Math.round((t.prefW ?? t.minW) / colW)))
    while (s < N && spanWidth(s) + 0.5 < t.minW) s++
    return s
  }

  // ── build units (singleton tiles + cohesive cluster groups) ────────────────
  const units: Unit[] = []
  const clustered = new Map<string, TileMeta[]>()
  for (const t of tiles) {
    if (t.cluster && CLUSTER_COLS[t.cluster]) {
      const a = clustered.get(t.cluster) ?? []
      a.push(t)
      clustered.set(t.cluster, a)
    } else {
      const span = spanOf(t)
      const w = spanWidth(span)
      units.push({
        kind: "tile",
        id: t.id,
        span,
        w,
        h: contentHeight(t.id, w),
        rank: rankOf(t),
        order: orderOf.get(t.id) ?? 0,
      })
    }
  }
  for (const [cluster, members] of clustered) {
    const cols = Math.max(1, Math.min(CLUSTER_COLS[cluster], N))
    const sorted = [...members].sort((a, b) => (a.clusterOrder ?? 0) - (b.clusterOrder ?? 0))
    // masonry-distribute members across the cluster's sub-columns (balance heights)
    const columns: Cell[][] = Array.from({ length: cols }, () => [])
    const colH = new Array<number>(cols).fill(0)
    for (const m of sorted) {
      const h = contentHeight(m.id, colW)
      let k = 0
      for (let i = 1; i < cols; i++) if (colH[i] < colH[k] - 0.5) k = i
      columns[k].push({ id: m.id, h })
      colH[k] += h + gutter
    }
    units.push({
      kind: "cluster",
      cols,
      columns,
      rank: TIER_RANK[sorted[0].priority] ?? 2,
      order: Math.min(...sorted.map((m) => orderOf.get(m.id) ?? 0)),
    })
  }
  units.sort((a, b) => a.rank - b.rank || a.order - b.order)

  // ── skyline placement ──────────────────────────────────────────────────────
  const colTop = new Array<number>(N).fill(gutter)
  const positions: Position[] = []

  for (const u of units) {
    const cols = u.kind === "tile" ? u.span : u.cols
    // pick the column-range: tiles minimize the max top (rigid block); clusters
    // minimize the SUM (they nestle per-column, so total low matters).
    let bestC = 0
    let best = Number.POSITIVE_INFINITY
    for (let c = 0; c <= N - cols; c++) {
      let metric = u.kind === "tile" ? colTop[c] : 0
      for (let k = 0; k < cols; k++) {
        if (u.kind === "tile") metric = Math.max(metric, colTop[c + k])
        else metric += colTop[c + k]
      }
      if (metric < best - 0.5) {
        best = metric
        bestC = c
      }
    }

    if (u.kind === "tile") {
      let y = colTop[bestC]
      for (let k = 1; k < cols; k++) y = Math.max(y, colTop[bestC + k])
      positions.push({ id: u.id, x: colX(bestC), y, w: u.w, h: u.h })
      const top = y + u.h + gutter
      for (let k = 0; k < cols; k++) colTop[bestC + k] = top
    } else {
      // each sub-column nestles independently into its own gap, but the rope
      // only stretches so far — sub-columns stay within CLUSTER_STRETCH of the
      // lowest one, so the group can't scatter across distant gaps.
      let maxTop = colTop[bestC]
      for (let k = 1; k < u.cols; k++) maxTop = Math.max(maxTop, colTop[bestC + k])
      const floor = maxTop - CLUSTER_STRETCH
      for (let k = 0; k < u.cols; k++) {
        let y = Math.max(colTop[bestC + k], floor)
        for (const cell of u.columns[k]) {
          positions.push({ id: cell.id, x: colX(bestC + k), y, w: colW, h: cell.h })
          y += cell.h + gutter
        }
        colTop[bestC + k] = y
      }
    }
  }

  const totalHeight = Math.max(gutter, ...colTop)
  return { positions, totalHeight }
}
