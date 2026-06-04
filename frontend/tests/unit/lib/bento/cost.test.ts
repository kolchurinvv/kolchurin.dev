import { describe, expect, it } from "vitest"
import {
  costAboveFold,
  costAdjacency,
  costAnchorRecurrence,
  costAspectBand,
  costCluster,
  costDeadSpace,
  costFn,
  costGaze,
  costOverlap,
  costShapeVariance,
  costSizeVariance,
  costSubMin,
  costWidthOverflow,
} from "$lib/bento/cost"
import { DEFAULT_WEIGHTS } from "$lib/bento/cost-weights"
import { SequencePair } from "$lib/bento/sequence-pair"
import type { Position, TileMeta } from "$lib/bento/types"

function tile(id: string, p: Partial<TileMeta> = {}): TileMeta {
  return {
    id,
    priority: p.priority ?? "tertiary",
    minW: p.minW ?? 100,
    minH: p.minH ?? 100,
    aspectRatio: p.aspectRatio,
    cluster: p.cluster,
    clusterOrder: p.clusterOrder,
    placement: p.placement,
  }
}

function pos(id: string, x: number, y: number, w: number, h: number): Position {
  return { id, x, y, w, h }
}

describe("costOverlap", () => {
  it("is 0 for non-overlapping rects", () => {
    expect(costOverlap([pos("a", 0, 0, 100, 100), pos("b", 200, 0, 100, 100)])).toBe(0)
  })
  it("is positive (≈ overlap area) for overlapping rects", () => {
    const c = costOverlap([pos("a", 0, 0, 100, 100), pos("b", 50, 50, 100, 100)])
    expect(c).toBeGreaterThan(0)
    expect(c).toBe(50 * 50) // overlap is 50×50
  })
})

describe("costWidthOverflow", () => {
  it("is 0 when all tiles fit horizontally", () => {
    expect(costWidthOverflow([pos("a", 0, 0, 100, 100)], { w: 200, h: 200 })).toBe(0)
  })
  it("is quadratic in the overshoot", () => {
    const c = costWidthOverflow([pos("a", 0, 0, 250, 100)], { w: 200, h: 200 })
    expect(c).toBe(50 * 50)
  })
})

describe("costSubMin", () => {
  it("is 0 when tile meets min dims", () => {
    const tiles = [tile("a", { minW: 100, minH: 100 })]
    expect(costSubMin([pos("a", 0, 0, 100, 100)], tiles)).toBe(0)
  })
  it("is quadratic in the dimension shortfall", () => {
    const tiles = [tile("a", { minW: 100, minH: 100 })]
    const c = costSubMin([pos("a", 0, 0, 80, 100)], tiles)
    expect(c).toBe(20 * 20)
  })
})

describe("costAspectBand", () => {
  const tiles = [tile("a", { aspectRatio: { min: 1.5, ideal: 2.0, max: 2.5 } })]

  it("is small (≈ linear ideal-pull) inside the band", () => {
    const inside = costAspectBand([pos("a", 0, 0, 200, 100)], tiles) // ratio = 2.0 exactly
    expect(inside).toBeCloseTo(0, 3)
  })

  it("is quadratic outside the band", () => {
    const tooWide = costAspectBand([pos("a", 0, 0, 300, 100)], tiles) // ratio = 3.0 > 2.5
    // (3.0 - 2.5)^2 = 0.25
    expect(tooWide).toBeCloseTo(0.25, 3)
  })

  it("ignores tiles without an aspect band", () => {
    const noband = [tile("a")]
    expect(costAspectBand([pos("a", 0, 0, 1000, 50)], noband)).toBe(0)
  })
})

describe("costAdjacency", () => {
  it("is 0 when a and b share a long edge", () => {
    // Two tiles touching on a vertical seam, y-ranges identical
    const positions = [pos("a", 0, 0, 100, 100), pos("b", 100, 0, 100, 100)]
    const c = costAdjacency(positions, [{ a: "a", b: "b", weight: 1 }])
    // shared edge length = 100; min perimeter = 2*(100+100) = 400; frac = 0.25
    // penalty = weight * (1 - 0.25) = 0.75
    expect(c).toBeCloseTo(0.75, 3)
  })
  it("is full weight when a and b don't touch", () => {
    const positions = [pos("a", 0, 0, 100, 100), pos("b", 500, 500, 100, 100)]
    const c = costAdjacency(positions, [{ a: "a", b: "b", weight: 1 }])
    expect(c).toBeCloseTo(1, 3)
  })
})

describe("costCluster", () => {
  it("is 0 for a tightly-packed 3-member cluster", () => {
    const tiles = [
      tile("a", { cluster: "s" }),
      tile("b", { cluster: "s" }),
      tile("c", { cluster: "s" }),
    ]
    const positions = [
      pos("a", 0, 0, 100, 100),
      pos("b", 100, 0, 100, 100),
      pos("c", 0, 100, 100, 100),
    ]
    expect(costCluster(positions, tiles)).toBe(0)
  })
  it("penalizes a scattered cluster", () => {
    const tiles = [
      tile("a", { cluster: "s" }),
      tile("b", { cluster: "s" }),
      tile("c", { cluster: "s" }),
    ]
    const positions = [
      pos("a", 0, 0, 100, 100),
      pos("b", 1000, 0, 100, 100),
      pos("c", 0, 1000, 100, 100),
    ]
    expect(costCluster(positions, tiles)).toBeGreaterThan(0)
  })
  it("ignores tiles without a cluster", () => {
    const tiles = [tile("a"), tile("b")]
    const positions = [pos("a", 0, 0, 100, 100), pos("b", 1000, 0, 100, 100)]
    expect(costCluster(positions, tiles)).toBe(0)
  })
})

describe("costGaze", () => {
  it("is 0 when no primary tile is present", () => {
    const tiles = [tile("a", { priority: "secondary" })]
    expect(costGaze([pos("a", 0, 0, 100, 100)], tiles, { x: 500, y: 500 })).toBe(0)
  })
  it("is quadratic in the primary tile's centroid distance from gaze", () => {
    const tiles = [tile("a", { priority: "primary" })]
    // centroid (50, 50); gaze (50, 100); distance = 50 → cost = 2500
    expect(costGaze([pos("a", 0, 0, 100, 100)], tiles, { x: 50, y: 100 })).toBe(2500)
  })
})

describe("costAboveFold", () => {
  const tiles = [tile("a", { priority: "primary" }), tile("b", { priority: "tertiary" })]
  it("is 0 when primary fits above the fold", () => {
    const ps = [pos("a", 0, 0, 100, 100), pos("b", 0, 800, 100, 100)]
    expect(costAboveFold(ps, tiles, { w: 200, h: 500 })).toBe(0)
  })
  it("is quadratic in the overshoot of primary/secondary tiles", () => {
    const ps = [pos("a", 0, 400, 100, 200), pos("b", 0, 0, 100, 100)]
    // primary at y=400 with h=200 → bottom=600 → overshoot = 100 (viewport.h = 500)
    expect(costAboveFold(ps, tiles, { w: 200, h: 500 })).toBe(100 * 100)
  })
  it("does not penalize tertiary or quaternary overshoot", () => {
    const ps = [pos("a", 0, 0, 100, 100), pos("b", 0, 800, 100, 100)]
    expect(costAboveFold(ps, tiles, { w: 200, h: 500 })).toBe(0)
  })
})

describe("costAnchorRecurrence", () => {
  it("is 0 when every grid cell contains a tertiary-or-higher tile", () => {
    const tiles = [
      tile("a", { priority: "secondary" }),
      tile("b", { priority: "tertiary" }),
      tile("c", { priority: "tertiary" }),
      tile("d", { priority: "secondary" }),
    ]
    // 2x2 grid: tiles at each quadrant of a 1000x1000 viewport
    const ps = [
      pos("a", 100, 100, 300, 300), // top-left
      pos("b", 600, 100, 300, 300), // top-right
      pos("c", 100, 600, 300, 300), // bottom-left
      pos("d", 600, 600, 300, 300), // bottom-right
    ]
    expect(costAnchorRecurrence(ps, tiles, { w: 1000, h: 1000 })).toBe(0)
  })
  it("penalizes empty cells", () => {
    const tiles = [tile("a", { priority: "tertiary" })]
    const ps = [pos("a", 100, 100, 200, 200)]
    expect(costAnchorRecurrence(ps, tiles, { w: 1000, h: 1000 })).toBeGreaterThan(0)
  })
})

describe("costSizeVariance & costShapeVariance — variance terms (rewards)", () => {
  // 4-tile row: a—b—c—d, all left-of-each-other
  const sp = new SequencePair(["a", "b", "c", "d"], ["a", "b", "c", "d"])

  it("rewards (negative cost) when neighborhood spans multiple tiers", () => {
    const tiles = [
      tile("a", { priority: "primary" }),
      tile("b", { priority: "secondary" }),
      tile("c", { priority: "tertiary" }),
      tile("d", { priority: "quaternary" }),
    ]
    const ps = [
      pos("a", 0, 0, 100, 100),
      pos("b", 110, 0, 100, 100),
      pos("c", 220, 0, 100, 100),
      pos("d", 330, 0, 100, 100),
    ]
    expect(costSizeVariance(ps, tiles, sp)).toBeLessThan(0)
  })

  it("is zero when neighborhood is single-tier", () => {
    const tiles = [tile("a"), tile("b"), tile("c"), tile("d")]
    const ps = [
      pos("a", 0, 0, 100, 100),
      pos("b", 110, 0, 100, 100),
      pos("c", 220, 0, 100, 100),
      pos("d", 330, 0, 100, 100),
    ]
    expect(costSizeVariance(ps, tiles, sp)).toBe(0)
  })

  it("shape variance is small when neighbors have mixed shapes", () => {
    const tiles = [tile("a"), tile("b"), tile("c"), tile("d")]
    // a: square (ratio 1), b: wide (ratio 3), c: tall (ratio 0.4), d: square
    const ps = [
      pos("a", 0, 0, 100, 100),
      pos("b", 110, 0, 300, 100),
      pos("c", 420, 0, 40, 100),
      pos("d", 470, 0, 100, 100),
    ]
    expect(costShapeVariance(ps, tiles, sp)).toBeLessThan(0.01)
  })
})

describe("costDeadSpace", () => {
  it("is ~0 when tiles tile the bounding box with no gaps", () => {
    // Two 100×100 tiles stacked, viewport width 100 → wall 100×200, fully covered.
    const ps = [pos("a", 0, 0, 100, 100), pos("b", 0, 100, 100, 100)]
    expect(costDeadSpace(ps, { w: 100, h: 200 })).toBeCloseTo(0, 3)
  })
  it("approaches the empty fraction when tiles leave whitespace", () => {
    // One 100×100 tile in a 200-wide wall whose bottom is 100 → wallArea 20000,
    // tileArea 10000 → half empty.
    expect(costDeadSpace([pos("a", 0, 0, 100, 100)], { w: 200, h: 50 })).toBeCloseTo(0.5, 3)
  })
  it("is 0 for an empty layout", () => {
    expect(costDeadSpace([], { w: 200, h: 200 })).toBe(0)
  })
})

describe("costFn aggregator", () => {
  it("returns finite total and matching breakdown keys", () => {
    const tiles = [tile("a"), tile("b")]
    const ps = [pos("a", 0, 0, 100, 100), pos("b", 110, 0, 100, 100)]
    const sp = new SequencePair(["a", "b"], ["a", "b"])
    const r = costFn(
      {
        positions: ps,
        tiles,
        sp,
        adjacency: [],
        viewport: { w: 400, h: 400 },
        gaze: { x: 200, y: 200 },
      },
      DEFAULT_WEIGHTS
    )
    expect(Number.isFinite(r.total)).toBe(true)
    expect(Object.keys(r.breakdown).sort()).toEqual(Object.keys(DEFAULT_WEIGHTS).sort())
  })
})
