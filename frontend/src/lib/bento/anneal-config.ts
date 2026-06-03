import { mulberry32 } from "./rng"

export interface AnnealConfig {
  initialT: number
  finalT: number
  cooling: number
  iterationsPerT: number
  plateauPatience: number
  rng: () => number
  /** Optional wall-clock budget (ms). Annealer returns best-seen when exceeded. */
  budgetMs?: number
}

/** Defaults aimed at ~500 ms for N=14 on a laptop. */
export function defaultAnnealConfig(seed: number = Date.now() & 0xffffffff): AnnealConfig {
  return {
    initialT: 1000,
    finalT: 1,
    cooling: 0.92,
    iterationsPerT: 30,
    plateauPatience: 60,
    rng: mulberry32(seed),
    budgetMs: 500,
  }
}
