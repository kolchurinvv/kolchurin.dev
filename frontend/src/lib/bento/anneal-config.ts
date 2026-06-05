import { mulberry32 } from "./rng"

export interface AnnealConfig {
  initialT: number
  finalT: number
  cooling: number
  iterationsPerT: number
  plateauPatience: number
  rng: () => number
  /**
   * FIXED iteration cap. Termination must be by iteration count, never
   * wall-clock — a time budget runs a different number of iterations per
   * machine/CPU-load, making the layout non-deterministic for the same input.
   */
  maxIterations?: number
}

/** Deterministic fixed-iteration schedule (~280 iters, cools 1000→~10). */
export function defaultAnnealConfig(seed = 1): AnnealConfig {
  return {
    initialT: 1000,
    finalT: 1,
    cooling: 0.82,
    iterationsPerT: 12,
    plateauPatience: 50,
    rng: mulberry32(seed),
    maxIterations: 280,
  }
}
