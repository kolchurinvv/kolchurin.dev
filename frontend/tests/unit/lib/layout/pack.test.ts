import { describe, expect, it } from "vitest"
import { packAnchored } from "../../../../src/lib/layout/pack"
import type {
  PackRequest,
  PackResponse,
  Position,
  StripLabel,
  TileMeta,
} from "../../../../src/lib/layout/types"

function tile(
  id: string,
  priority: number,
  naturalW = 320,
  naturalH = 200,
  minW = 160,
  minH = 100
): TileMeta {
  return { id, priority, minW, minH, naturalW, naturalH }
}

const SAMPLE: TileMeta[] = [
  tile("experience", 10),
  tile("skills", 8),
  tile("about", 6),
  tile("terminal", 5),
  tile("projects", 4),
  tile("header", 3),
  tile("certs", 2),
  tile("footer", 1),
]

function makeRequest(overrides: Partial<PackRequest> = {}): PackRequest {
  return {
    viewport: { w: 1280, h: 720 },
    gaze: { x: 640, y: 274 },
    gutter: 0,
    tiles: SAMPLE,
    ...overrides,
  }
}

function rectsOverlap(a: Position, b: Position): boolean {
  return (
    a.x < b.x + b.w - 0.5 && a.x + a.w > b.x + 0.5 && a.y < b.y + b.h - 0.5 && a.y + a.h > b.y + 0.5
  )
}

function expectPack(res: PackResponse): {
  positions: Position[]
  assignment: Record<string, StripLabel>
} {
  expect(res.mode).toBe("pack")
  if (res.mode !== "pack") throw new Error("not pack")
  return res
}

describe("packAnchored", () => {
  it("returns empty positions for an empty tile list", () => {
    const res = packAnchored(makeRequest({ tiles: [] }))
    const pack = expectPack(res)
    expect(pack.positions).toEqual([])
  })

  it("gives a single tile the full viewport", () => {
    const res = packAnchored(makeRequest({ tiles: [tile("only", 1)], gutter: 0 }))
    const pack = expectPack(res)
    expect(pack.positions).toHaveLength(1)
    expect(pack.positions[0].w).toBe(1280)
    expect(pack.positions[0].h).toBe(720)
  })

  it("is deterministic for identical input", () => {
    const a = packAnchored(makeRequest())
    const b = packAnchored(makeRequest())
    expect(a).toEqual(b)
  })

  it("places the highest-priority tile near the gaze point", () => {
    const res = packAnchored(makeRequest())
    const pack = expectPack(res)
    const anchor = pack.positions.find((p) => p.id === "experience")
    expect(anchor).toBeDefined()
    if (!anchor) return
    const cx = anchor.x + anchor.w / 2
    const cy = anchor.y + anchor.h / 2
    // gaze is at (640, 274); anchor center should be within ±anchor.w/2 of it
    expect(Math.abs(cx - 640)).toBeLessThan(anchor.w / 2 + 1)
    expect(Math.abs(cy - 274)).toBeLessThan(anchor.h / 2 + 1)
  })

  it("partitions the viewport without overlaps when gutter is 0", () => {
    const res = packAnchored(makeRequest({ gutter: 0 }))
    const pack = expectPack(res)
    for (let i = 0; i < pack.positions.length; i++) {
      for (let j = i + 1; j < pack.positions.length; j++) {
        expect(rectsOverlap(pack.positions[i], pack.positions[j])).toBe(false)
      }
    }
  })

  it("covers the viewport area within a small tolerance when gutter is 0", () => {
    const W = 1280
    const H = 720
    const res = packAnchored(makeRequest({ viewport: { w: W, h: H }, gutter: 0 }))
    const pack = expectPack(res)
    const totalArea = pack.positions.reduce((acc, p) => acc + p.w * p.h, 0)
    // Allow a small tolerance for floating-point rounding
    expect(Math.abs(totalArea - W * H)).toBeLessThan(W * H * 0.01)
  })

  it("keeps every position inside the viewport bounds", () => {
    const res = packAnchored(makeRequest())
    const pack = expectPack(res)
    for (const p of pack.positions) {
      expect(p.x).toBeGreaterThanOrEqual(-0.5)
      expect(p.y).toBeGreaterThanOrEqual(-0.5)
      expect(p.x + p.w).toBeLessThanOrEqual(1280 + 0.5)
      expect(p.y + p.h).toBeLessThanOrEqual(720 + 0.5)
    }
  })

  it("returns one position per input tile", () => {
    const res = packAnchored(makeRequest())
    const pack = expectPack(res)
    expect(pack.positions).toHaveLength(SAMPLE.length)
    const ids = new Set(pack.positions.map((p) => p.id))
    for (const t of SAMPLE) expect(ids.has(t.id)).toBe(true)
  })

  it("grows an overflowing tile on re-pack", () => {
    const first = expectPack(packAnchored(makeRequest()))
    const overflowingTile = first.positions.find((p) => p.id === "about")
    expect(overflowingTile).toBeDefined()
    if (!overflowingTile) return
    const targetRequired = overflowingTile.h + 80
    const overflowTiles = SAMPLE.map((t) =>
      t.id === "about" ? { ...t, requiredH: targetRequired } : t
    )
    const second = expectPack(
      packAnchored(
        makeRequest({
          tiles: overflowTiles,
          overflowingIds: ["about"],
        })
      )
    )
    const grown = second.positions.find((p) => p.id === "about")
    expect(grown).toBeDefined()
    if (!grown) return
    expect(grown.h).toBeGreaterThan(overflowingTile.h)
  })

  it("respects the priority order when assigning anchor size", () => {
    // Swap priorities: now `header` is highest
    const swapped = SAMPLE.map((t) => (t.id === "header" ? { ...t, priority: 100 } : t))
    const res = expectPack(packAnchored(makeRequest({ tiles: swapped })))
    // Largest tile by area should be `header`
    const byArea = res.positions
      .map((p) => ({ id: p.id, area: p.w * p.h }))
      .sort((a, b) => b.area - a.area)
    expect(byArea[0].id).toBe("header")
  })

  it("breaks ties by id for stable ordering", () => {
    const ties: TileMeta[] = [tile("zebra", 5), tile("alpha", 5), tile("mike", 5)]
    const res = expectPack(packAnchored(makeRequest({ tiles: ties })))
    // After stable sort by priority desc then id asc, anchor should be 'alpha'
    const sortedByArea = [...res.positions].sort((a, b) => b.w * b.h - a.w * a.h)
    expect(sortedByArea[0].id).toBe("alpha")
  })

  it("inserts gutter spacing without overlapping tiles", () => {
    const res = expectPack(packAnchored(makeRequest({ gutter: 16 })))
    for (let i = 0; i < res.positions.length; i++) {
      for (let j = i + 1; j < res.positions.length; j++) {
        expect(rectsOverlap(res.positions[i], res.positions[j])).toBe(false)
      }
    }
  })

  it("handles two tiles cleanly", () => {
    const res = expectPack(
      packAnchored(makeRequest({ tiles: [tile("a", 10), tile("b", 5)], gutter: 0 }))
    )
    expect(res.positions).toHaveLength(2)
    // The two rectangles should together cover the viewport
    const total = res.positions.reduce((acc, p) => acc + p.w * p.h, 0)
    expect(total).toBeCloseTo(1280 * 720, -2)
  })

  it("returns assignment for non-anchor tiles", () => {
    const res = expectPack(packAnchored(makeRequest()))
    // anchor (experience) should not be in assignment; the other 7 should be
    expect(Object.keys(res.assignment)).toHaveLength(SAMPLE.length - 1)
    expect(res.assignment).not.toHaveProperty("experience")
    for (const id of ["skills", "about", "terminal", "projects", "header", "certs", "footer"]) {
      expect(["top", "bot", "left", "right"]).toContain(res.assignment[id])
    }
  })

  it("uses anchorId to override the priority-based anchor", () => {
    const res = expectPack(
      packAnchored(
        makeRequest({
          anchorId: "footer",
          anchorSize: { w: 600, h: 400 },
        })
      )
    )
    const footer = res.positions.find((p) => p.id === "footer")
    expect(footer).toBeDefined()
    if (!footer) return
    expect(footer.w).toBe(600)
    expect(footer.h).toBe(400)
    // footer's center should be near the gaze point
    const cx = footer.x + footer.w / 2
    const cy = footer.y + footer.h / 2
    expect(Math.abs(cx - 640)).toBeLessThan(1)
    expect(Math.abs(cy - 274)).toBeLessThan(1)
  })

  it("uses anchorSize verbatim regardless of weight share", () => {
    const res = expectPack(
      packAnchored(makeRequest({ anchorId: "experience", anchorSize: { w: 500, h: 300 } }))
    )
    const anchor = res.positions.find((p) => p.id === "experience")
    expect(anchor).toBeDefined()
    if (!anchor) return
    expect(anchor.w).toBe(500)
    expect(anchor.h).toBe(300)
  })

  it("keeps tile→strip mapping stable when pinnedAssignment is passed back", () => {
    const first = expectPack(packAnchored(makeRequest()))
    const second = expectPack(
      packAnchored(
        makeRequest({
          pinnedAssignment: { ...first.assignment },
          overflowingIds: ["about"],
          tiles: SAMPLE.map((t) => (t.id === "about" ? { ...t, requiredH: 400 } : t)),
        })
      )
    )
    // Every non-anchor tile lands in the same strip across the two packs
    for (const id of Object.keys(first.assignment)) {
      expect(second.assignment[id]).toBe(first.assignment[id])
    }
  })

  it("falls back to weight-based assignment for tiles missing from pinnedAssignment", () => {
    const partial: Record<string, StripLabel> = {
      skills: "top",
      about: "bot",
    }
    const res = expectPack(packAnchored(makeRequest({ pinnedAssignment: partial })))
    expect(res.assignment.skills).toBe("top")
    expect(res.assignment.about).toBe("bot")
    // Unpinned tiles are still placed somewhere
    for (const id of ["terminal", "projects", "header", "certs", "footer"]) {
      expect(["top", "bot", "left", "right"]).toContain(res.assignment[id])
    }
  })

  it("keeps the anchor's area share modest with the flatter weight", () => {
    const W = 1920
    const H = 1080
    const res = expectPack(packAnchored(makeRequest({ viewport: { w: W, h: H } })))
    const anchor = res.positions.find((p) => p.id === "experience")
    expect(anchor).toBeDefined()
    if (!anchor) return
    const share = (anchor.w * anchor.h) / (W * H)
    expect(share).toBeLessThanOrEqual(0.4 + 0.01)
  })
})
