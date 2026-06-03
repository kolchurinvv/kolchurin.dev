import { describe, expect, it } from "vitest"
import { BENTO_TILES } from "$lib/bento/inventory"
import { lpSolve } from "$lib/bento/lp-solver"
import { mulberry32 } from "$lib/bento/rng"
import { SequencePair } from "$lib/bento/sequence-pair"
import type { TileMeta } from "$lib/bento/types"

const GUTTER = 8

function tile(id: string, opts: Partial<TileMeta> = {}): TileMeta {
  return {
    id,
    priority: opts.priority ?? "tertiary",
    minW: opts.minW ?? 100,
    minH: opts.minH ?? 100,
    aspectRatio: opts.aspectRatio,
    cluster: opts.cluster,
    clusterOrder: opts.clusterOrder,
    placement: opts.placement,
  }
}

describe("lpSolve — Step 3a (longest-path with fixed-ish sizes)", () => {
  it("two tiles side by side fit a wide viewport", () => {
    // Γ⁺ = [a, b], Γ⁻ = [a, b] → a left-of b
    const sp = new SequencePair(["a", "b"], ["a", "b"])
    const tiles = [tile("a"), tile("b")]
    const r = lpSolve(sp, tiles, { w: 800, h: 400 }, GUTTER)
    expect(r.feasible).toBe(true)
    const [pa, pb] = r.positions
    // pa left of pb (pa.x + pa.w + gutter ≤ pb.x)
    expect(pa.x + pa.w + GUTTER).toBeLessThanOrEqual(pb.x + 0.5)
    // Both fit horizontally
    expect(pb.x + pb.w + GUTTER).toBeLessThanOrEqual(800 + 0.5)
  })

  it("two stacked tiles produce non-trivial totalHeight", () => {
    // Γ⁺ = [a, b], Γ⁻ = [b, a] → a above b
    const sp = new SequencePair(["a", "b"], ["b", "a"])
    const tiles = [tile("a"), tile("b")]
    const r = lpSolve(sp, tiles, { w: 800, h: 600 }, GUTTER)
    expect(r.feasible).toBe(true)
    const [pa, pb] = r.positions
    expect(pa.y + pa.h + GUTTER).toBeLessThanOrEqual(pb.y + 0.5)
    expect(r.totalHeight).toBeGreaterThan(pa.h + pb.h)
  })

  it("respects min dims", () => {
    const sp = new SequencePair(["a", "b"], ["a", "b"])
    const tiles = [tile("a", { minW: 200, minH: 200 }), tile("b", { minW: 200, minH: 200 })]
    const r = lpSolve(sp, tiles, { w: 800, h: 400 }, GUTTER)
    expect(r.feasible).toBe(true)
    for (const p of r.positions) {
      expect(p.w).toBeGreaterThanOrEqual(200)
      expect(p.h).toBeGreaterThanOrEqual(200)
    }
  })

  it("flags infeasible when min dims can never fit", () => {
    const sp = new SequencePair(["a", "b"], ["a", "b"])
    const tiles = [tile("a", { minW: 700 }), tile("b", { minW: 700 })]
    const r = lpSolve(sp, tiles, { w: 800, h: 400 }, GUTTER)
    expect(r.feasible).toBe(false)
    expect(r.violations.length).toBeGreaterThan(0)
  })
})

describe("lpSolve — Step 3b (aspect band, viewport fit)", () => {
  it("a tight aspect band keeps the rendered ratio inside it", () => {
    const sp = new SequencePair(["a"], ["a"])
    const tiles = [
      tile("a", {
        minW: 200,
        minH: 100,
        aspectRatio: { min: 1.8, ideal: 2.0, max: 2.2 },
      }),
    ]
    const r = lpSolve(sp, tiles, { w: 800, h: 400 }, GUTTER)
    expect(r.feasible).toBe(true)
    const [p] = r.positions
    const ratio = p.w / p.h
    expect(ratio).toBeGreaterThanOrEqual(1.8 - 0.01)
    expect(ratio).toBeLessThanOrEqual(2.2 + 0.01)
  })

  it("packs the 14-tile bento inventory at W=1440 without infeasibility", () => {
    const sp = SequencePair.fromTierMajor(BENTO_TILES, mulberry32(1))
    const r = lpSolve(sp, BENTO_TILES, { w: 1440, h: 900 }, 12)
    // Either feasible OR the only violations are soft aspect-band ones.
    if (!r.feasible) {
      const hard = r.violations.filter((v) => v.kind !== "aspect")
      expect(hard, `unexpected hard violations: ${JSON.stringify(hard)}`).toHaveLength(0)
    }
    expect(r.positions).toHaveLength(BENTO_TILES.length)
    for (const p of r.positions) {
      expect(p.w).toBeGreaterThan(0)
      expect(p.h).toBeGreaterThan(0)
    }
  })

  it("packs at W=1024 (tighter) without crashing", () => {
    const sp = SequencePair.fromTierMajor(BENTO_TILES, mulberry32(2))
    const r = lpSolve(sp, BENTO_TILES, { w: 1024, h: 768 }, 12)
    expect(r.positions).toHaveLength(BENTO_TILES.length)
    // Total height should be positive and reasonable (not zero, not insane)
    expect(r.totalHeight).toBeGreaterThan(0)
    expect(r.totalHeight).toBeLessThan(20000)
  })
})

describe("lpSolve — perf (informational, not a strict gate)", () => {
  it("runs in under 30ms for N=14 (5 trials average)", () => {
    const sp = SequencePair.fromTierMajor(BENTO_TILES, mulberry32(1))
    const viewport = { w: 1440, h: 900 }
    // warm-up
    lpSolve(sp, BENTO_TILES, viewport, 12)
    const start = performance.now()
    for (let i = 0; i < 5; i++) lpSolve(sp, BENTO_TILES, viewport, 12)
    const avg = (performance.now() - start) / 5
    // Generous bound for CI variance; aim is ~1-3ms; flag if >30ms.
    expect(avg, `avg lpSolve(N=14) was ${avg.toFixed(2)} ms`).toBeLessThan(30)
  })
})

describe("lpSolve — disjoint pairs (no edges) on a wide viewport", () => {
  it("places 4 unrelated tiles with positive coords and totalHeight", () => {
    // SP where Γ⁺ and Γ⁻ are reverses of each other → ALL pairs are above-of
    // (a precedes b in Γ⁺, b precedes a in Γ⁻ → a above b). So everyone is stacked.
    const sp = new SequencePair(["a", "b", "c", "d"], ["d", "c", "b", "a"])
    const tiles = ["a", "b", "c", "d"].map((id) => tile(id))
    const r = lpSolve(sp, tiles, { w: 800, h: 600 }, GUTTER)
    expect(r.positions).toHaveLength(4)
    expect(r.totalHeight).toBeGreaterThan(0)
  })
})
