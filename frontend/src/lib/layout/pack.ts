import type { PackRequest, PackResponse, Position, TileMeta } from "./types"

const PRIORITY_EXPONENT = 1.4
const MIN_TILE_FALLBACK_AREA = 100 * 100
const MAX_ANCHOR_AREA_RATIO = 0.5
const MIN_ANCHOR_AREA_RATIO = 0.22
const MAX_ANCHOR_DIMENSION_RATIO = 0.7

type Strip = {
  label: "top" | "bot" | "left" | "right"
  x: number
  y: number
  w: number
  h: number
}

function clamp(value: number, lo: number, hi: number): number {
  if (lo > hi) return lo
  return Math.min(hi, Math.max(lo, value))
}

function tileArea(t: TileMeta): number {
  return Math.max(t.naturalW * t.naturalH, t.minW * t.minH, MIN_TILE_FALLBACK_AREA)
}

function tileWeight(t: TileMeta): number {
  const priority = Math.max(t.priority, 0.0001)
  return priority ** PRIORITY_EXPONENT * tileArea(t)
}

function compareForOrder(a: TileMeta, b: TileMeta): number {
  if (b.priority !== a.priority) return b.priority - a.priority
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

function applyOverflowHints(tiles: TileMeta[], overflowingIds: string[] | undefined): TileMeta[] {
  if (!overflowingIds || overflowingIds.length === 0) return tiles
  const overflowing = new Set(overflowingIds)
  return tiles.map((t) => {
    if (!overflowing.has(t.id)) return t
    const required = t.requiredH ?? t.naturalH
    return {
      ...t,
      minH: Math.max(t.minH, required),
      naturalH: Math.max(t.naturalH, required),
    }
  })
}

function packSingleTile(tile: TileMeta, w: number, h: number): Position {
  return { id: tile.id, x: 0, y: 0, w, h }
}

function computeAnchorRect(
  anchor: TileMeta,
  rest: TileMeta[],
  W: number,
  H: number,
  gazeX: number,
  gazeY: number,
  gutter: number
): { ax: number; ay: number; aw: number; ah: number } {
  const anchorW = tileWeight(anchor)
  const totalW = rest.reduce((acc, t) => acc + tileWeight(t), anchorW)
  const share = totalW > 0 ? anchorW / totalW : 1
  const viewportArea = W * H
  const minArea = Math.max(
    anchor.minW * anchor.minH,
    tileArea(anchor) * 0.5,
    viewportArea * MIN_ANCHOR_AREA_RATIO
  )
  const maxArea = viewportArea * MAX_ANCHOR_AREA_RATIO
  const targetArea = clamp(viewportArea * share, minArea, maxArea)

  const naturalAspect =
    anchor.naturalW > 0 && anchor.naturalH > 0 ? anchor.naturalW / anchor.naturalH : W / H
  let aw = Math.sqrt(targetArea * naturalAspect)
  let ah = Math.sqrt(targetArea / naturalAspect)

  aw = clamp(aw, anchor.minW, Math.max(anchor.minW, W * MAX_ANCHOR_DIMENSION_RATIO))
  ah = clamp(ah, anchor.minH, Math.max(anchor.minH, H * MAX_ANCHOR_DIMENSION_RATIO))

  const ax = clamp(gazeX - aw / 2, 0, Math.max(0, W - aw))
  const ay = clamp(gazeY - ah / 2, 0, Math.max(0, H - ah))

  return { ax, ay, aw, ah }
}

function candidateStrips(
  W: number,
  H: number,
  ax: number,
  ay: number,
  aw: number,
  ah: number
): Strip[] {
  const strips: Strip[] = []
  if (ay > 0) strips.push({ label: "top", x: 0, y: 0, w: W, h: ay })
  if (ay + ah < H) strips.push({ label: "bot", x: 0, y: ay + ah, w: W, h: H - ay - ah })
  if (ax > 0) strips.push({ label: "left", x: 0, y: ay, w: ax, h: ah })
  if (ax + aw < W) strips.push({ label: "right", x: ax + aw, y: ay, w: W - ax - aw, h: ah })
  return strips
}

const MIN_ANCHOR_DIMENSION_RATIO = 0.35

function resizeForOverflow(
  W: number,
  H: number,
  anchor: { ax: number; ay: number; aw: number; ah: number },
  strips: Strip[],
  stripTiles: TileMeta[][]
): { anchor: { ax: number; ay: number; aw: number; ah: number }; strips: Strip[]; stripTiles: TileMeta[][] } {
  let { ax, ay, aw, ah } = anchor

  const labelTiles: Record<string, TileMeta[]> = {}
  for (let i = 0; i < strips.length; i++) {
    labelTiles[strips[i].label] = stripTiles[i]
  }

  function maxRequired(label: string): number {
    const list = labelTiles[label]
    if (!list) return 0
    return list.reduce((acc, t) => Math.max(acc, t.requiredH ?? 0), 0)
  }

  const topReq = maxRequired("top")
  const botReq = maxRequired("bot")
  const sideReq = Math.max(maxRequired("left"), maxRequired("right"))

  const minAnchorH = Math.max(40, H * MIN_ANCHOR_DIMENSION_RATIO)

  const topH = ay
  const botH = H - ay - ah

  if (topReq > topH) {
    const need = topReq - topH
    const available = Math.max(0, ah - minAnchorH)
    const take = Math.min(need, available)
    ay += take
    ah -= take
  }
  if (botReq > botH) {
    const need = botReq - (H - ay - ah)
    const available = Math.max(0, ah - minAnchorH)
    const take = Math.min(need, available)
    ah -= take
  }

  if (sideReq > ah) {
    const need = sideReq - ah
    const availTop = ay
    const availBot = H - ay - ah
    const total = availTop + availBot
    if (total > 0) {
      const fromTop = Math.min(availTop, need * (availTop / total))
      const fromBot = Math.min(availBot, need * (availBot / total))
      ay -= fromTop
      ah += fromTop + fromBot
    }
  }

  const newStrips = candidateStrips(W, H, ax, ay, aw, ah)
  const newStripTiles = newStrips.map((s) => labelTiles[s.label] ?? [])

  return { anchor: { ax, ay, aw, ah }, strips: newStrips, stripTiles: newStripTiles }
}

function absorbDroppedStrips(
  anchor: { ax: number; ay: number; aw: number; ah: number },
  dropped: Strip[],
  W: number,
  H: number
): { ax: number; ay: number; aw: number; ah: number } {
  let { ax, ay, aw, ah } = anchor
  for (const d of dropped) {
    if (d.label === "top") {
      ah = ah + ay
      ay = 0
    } else if (d.label === "bot") {
      ah = H - ay
    } else if (d.label === "left") {
      aw = aw + ax
      ax = 0
    } else if (d.label === "right") {
      aw = W - ax
    }
  }
  return { ax, ay, aw, ah }
}

function assignTilesToStrips(strips: Strip[], remaining: TileMeta[]): TileMeta[][] {
  const totalArea = strips.reduce((acc, s) => acc + s.w * s.h, 0) || 1
  const totalWeight = remaining.reduce((acc, t) => acc + tileWeight(t), 0) || 1
  const buckets: { strip: Strip; tiles: TileMeta[]; usedWeight: number; targetWeight: number }[] =
    strips.map((s) => ({
      strip: s,
      tiles: [],
      usedWeight: 0,
      targetWeight: ((s.w * s.h) / totalArea) * totalWeight,
    }))

  for (const tile of remaining) {
    const requiredH = tile.requiredH ?? 0
    let bestIdx = 0

    if (requiredH > 0) {
      // Overflow tile: prefer the tallest strip; resize logic can grow that band.
      let bestH = -Infinity
      let bestSlack = -Infinity
      for (let i = 0; i < buckets.length; i++) {
        const h = buckets[i].strip.h
        const slack = buckets[i].targetWeight - buckets[i].usedWeight
        if (h > bestH || (h === bestH && slack > bestSlack)) {
          bestH = h
          bestSlack = slack
          bestIdx = i
        }
      }
    } else {
      let bestSlack = -Infinity
      for (let i = 0; i < buckets.length; i++) {
        const slack = buckets[i].targetWeight - buckets[i].usedWeight
        if (slack > bestSlack) {
          bestSlack = slack
          bestIdx = i
        }
      }
    }
    buckets[bestIdx].tiles.push(tile)
    buckets[bestIdx].usedWeight += tileWeight(tile)
  }

  return buckets.map((b) => b.tiles)
}

function allocateAlongAxis(
  total: number,
  tiles: TileMeta[],
  minOf: (t: TileMeta) => number,
  naturalOf: (t: TileMeta) => number
): number[] {
  const n = tiles.length
  if (n === 0) return []
  const mins = tiles.map(minOf)
  const naturals = tiles.map((t) => Math.max(naturalOf(t), minOf(t)))
  const weights = tiles.map(tileWeight)
  const sumNatural = naturals.reduce((a, b) => a + b, 0)
  const sumMin = mins.reduce((a, b) => a + b, 0)
  const sumWeight = weights.reduce((a, b) => a + b, 0) || 1

  if (sumNatural <= total) {
    // All tiles fit at natural sizes. Distribute remaining by weight.
    const remainder = total - sumNatural
    return tiles.map((_, i) => naturals[i] + (remainder * weights[i]) / sumWeight)
  }
  if (sumMin <= total) {
    // Natural exceeds total but mins fit. Allocate min + proportional share of slack.
    const slack = total - sumMin
    const naturalSlack = naturals.map((n, i) => Math.max(0, n - mins[i]))
    const sumNaturalSlack = naturalSlack.reduce((a, b) => a + b, 0) || 1
    return tiles.map((_, i) => mins[i] + (slack * naturalSlack[i]) / sumNaturalSlack)
  }
  // Even mins don't fit: scale mins proportionally
  return mins.map((m) => (m * total) / sumMin)
}

function packStrip(strip: Strip, tiles: TileMeta[], gutter: number): Position[] {
  if (tiles.length === 0) return []
  const half = gutter / 2

  if (tiles.length === 1) {
    const t = tiles[0]
    return [
      {
        id: t.id,
        x: strip.x + half,
        y: strip.y + half,
        w: strip.w - gutter,
        h: strip.h - gutter,
      },
    ]
  }

  const positions: Position[] = []
  const cutHorizontally = strip.w >= strip.h

  if (cutHorizontally) {
    // Wide strip: cut into columns. Use width as the allocation axis.
    const widths = allocateAlongAxis(
      strip.w,
      tiles,
      (t) => t.minW,
      (t) => Math.max(t.naturalW, t.minW)
    )
    let cursor = strip.x
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i]
      const w = i === tiles.length - 1 ? strip.x + strip.w - cursor : widths[i]
      positions.push({
        id: t.id,
        x: cursor + half,
        y: strip.y + half,
        w: w - gutter,
        h: strip.h - gutter,
      })
      cursor += w
    }
  } else {
    // Tall strip: cut into rows. Allocate height to each tile.
    const heights = allocateAlongAxis(
      strip.h,
      tiles,
      (t) => t.minH,
      (t) => Math.max(t.requiredH ?? 0, t.naturalH, t.minH)
    )
    let cursor = strip.y
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i]
      const h = i === tiles.length - 1 ? strip.y + strip.h - cursor : heights[i]
      positions.push({
        id: t.id,
        x: strip.x + half,
        y: cursor + half,
        w: strip.w - gutter,
        h: h - gutter,
      })
      cursor += h
    }
  }

  return positions
}

export function packAnchored(req: PackRequest): PackResponse {
  if (req.tiles.length === 0) return { mode: "pack", positions: [] }

  const tiles = applyOverflowHints(req.tiles, req.overflowingIds).slice().sort(compareForOrder)
  const W = req.viewport.w
  const H = req.viewport.h
  const gutter = Math.max(0, req.gutter)
  const half = gutter / 2

  if (tiles.length === 1) {
    return {
      mode: "pack",
      positions: [packSingleTile(tiles[0], W - gutter, H - gutter)].map((p) => ({
        ...p,
        x: half,
        y: half,
      })),
    }
  }

  const anchor = tiles[0]
  const rest = tiles.slice(1)

  let anchorRect = computeAnchorRect(anchor, rest, W, H, req.gaze.x, req.gaze.y, gutter)
  let strips = candidateStrips(W, H, anchorRect.ax, anchorRect.ay, anchorRect.aw, anchorRect.ah)

  if (rest.length < strips.length) {
    strips.sort((a, b) => b.w * b.h - a.w * a.h)
    const chosen = strips.slice(0, rest.length)
    const dropped = strips.slice(rest.length)
    anchorRect = absorbDroppedStrips(anchorRect, dropped, W, H)
    strips = chosen
  }

  let stripTiles = assignTilesToStrips(strips, rest)

  if (req.overflowingIds && req.overflowingIds.length > 0) {
    const resized = resizeForOverflow(W, H, anchorRect, strips, stripTiles)
    anchorRect = resized.anchor
    strips = resized.strips
    stripTiles = resized.stripTiles
  }

  const positions: Position[] = [
    {
      id: anchor.id,
      x: anchorRect.ax + half,
      y: anchorRect.ay + half,
      w: anchorRect.aw - gutter,
      h: anchorRect.ah - gutter,
    },
  ]

  for (let i = 0; i < strips.length; i++) {
    positions.push(...packStrip(strips[i], stripTiles[i], gutter))
  }

  return { mode: "pack", positions }
}

