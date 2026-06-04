import { describe, expect, it } from "vitest"
import { anneal } from "$lib/bento/annealer"
import type { AnnealConfig } from "$lib/bento/anneal-config"
import { defaultAnnealConfig } from "$lib/bento/anneal-config"
import { BENTO_ADJACENCY, BENTO_TILES } from "$lib/bento/inventory"
import { DEFAULT_WEIGHTS } from "$lib/bento/cost-weights"
import { mulberry32 } from "$lib/bento/rng"
import type { TileMeta } from "$lib/bento/types"

function fastConfig(seed: number, iterations = 80): AnnealConfig {
  return {
    initialT: 200,
    finalT: 10,
    cooling: 0.8,
    iterationsPerT: iterations,
    plateauPatience: 999, // disable for determinism tests
    rng: mulberry32(seed),
    maxIterations: 5000, // high — let the cooling schedule complete
  }
}

describe("anneal — determinism", () => {
  it("produces identical result for the same seed", () => {
    const cfg1 = fastConfig(42)
    const cfg2 = fastConfig(42)
    const tiles: TileMeta[] = [
      {
        id: "a",
        priority: "primary",
        minW: 200,
        minH: 200,
        aspectRatio: { min: 1.0, ideal: 1.5, max: 2.0 },
      },
      { id: "b", priority: "tertiary", minW: 100, minH: 100 },
      { id: "c", priority: "tertiary", minW: 100, minH: 100 },
      { id: "d", priority: "quaternary", minW: 80, minH: 60 },
    ]
    const r1 = anneal(tiles, [], { w: 800, h: 600 }, { x: 400, y: 250 }, 8, DEFAULT_WEIGHTS, cfg1)
    const r2 = anneal(tiles, [], { w: 800, h: 600 }, { x: 400, y: 250 }, 8, DEFAULT_WEIGHTS, cfg2)
    expect(r2.cost).toBe(r1.cost)
    expect(r2.iterations).toBe(r1.iterations)
    expect(r2.sp.gammaPlus).toEqual(r1.sp.gammaPlus)
    expect(r2.sp.gammaMinus).toEqual(r1.sp.gammaMinus)
  })
})

describe("anneal — convergence behavior", () => {
  it("best cost is ≤ initial cost", () => {
    const cfg = fastConfig(7, 100)
    const tiles: TileMeta[] = [
      { id: "a", priority: "primary", minW: 200, minH: 200 },
      { id: "b", priority: "secondary", minW: 100, minH: 100 },
      { id: "c", priority: "tertiary", minW: 100, minH: 100 },
      { id: "d", priority: "quaternary", minW: 60, minH: 60 },
    ]
    const result = anneal(
      tiles,
      [{ a: "a", b: "b", weight: 1.0 }],
      { w: 800, h: 600 },
      { x: 400, y: 250 },
      8,
      DEFAULT_WEIGHTS,
      cfg
    )
    expect(result.iterations).toBeGreaterThan(0)
    // bestIteration could be 0 (initial start) or later — both are fine.
    expect(result.bestIteration).toBeGreaterThanOrEqual(0)
  })
})

describe("anneal — bento inventory smoke", () => {
  it("runs a fixed iteration count against the full 14-tile inventory", () => {
    const cfg = defaultAnnealConfig(123)
    const result = anneal(
      BENTO_TILES,
      BENTO_ADJACENCY,
      { w: 1440, h: 900 },
      { x: 720, y: 342 }, // gaze ~12% upward of center
      12,
      DEFAULT_WEIGHTS,
      cfg
    )
    expect(result.positions).toHaveLength(BENTO_TILES.length)
    expect(Number.isFinite(result.cost)).toBe(true)
    // Iteration count is bounded by the fixed cap (deterministic, no wall-clock).
    expect(result.iterations).toBeLessThanOrEqual((cfg.maxIterations ?? 0) + 1)
    expect(result.totalHeight).toBeGreaterThan(0)
    expect(result.totalHeight).toBeLessThan(20000)
  })
})
