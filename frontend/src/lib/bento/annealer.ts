/**
 * Simulated-annealing topology search over sequence pairs.
 *
 * Each iteration:
 *   1. Perturb the current SequencePair (one of three move operators).
 *   2. Re-run the LP solver on the new SP.
 *   3. Evaluate the cost function.
 *   4. Accept by Metropolis criterion (Δ ≤ 0 ⇒ always; else exp(-Δ/T)).
 *
 * Tracks best-seen (sp, positions, cost) across all iterations; returns the best.
 * Early-exits if no improvement for `plateauPatience` iterations at the current
 * temperature, or if the wall-clock budget is exceeded.
 */

import type { AnnealConfig } from "./anneal-config"
import { costFn } from "./cost"
import type { CostWeights } from "./cost-weights"
import { lpSolve } from "./lp-solver"
import { SequencePair } from "./sequence-pair"
import type { AdjacencyHint, GazePoint, Position, TileMeta, Viewport } from "./types"

export interface AnnealResult {
  sp: SequencePair
  positions: Position[]
  totalHeight: number
  feasible: boolean
  cost: number
  iterations: number
  bestIteration: number
}

export function anneal(
  tiles: readonly TileMeta[],
  adjacency: readonly AdjacencyHint[],
  viewport: Viewport,
  gaze: GazePoint,
  gutter: number,
  weights: CostWeights,
  config: AnnealConfig
): AnnealResult {
  const startMs = performance.now()

  // Initial SP — tier-major start (heuristic; usually better than fully random).
  let sp = SequencePair.fromTierMajor(tiles, config.rng)
  let solve = lpSolve(sp, tiles, viewport, gutter)
  let cost = costFn(
    {
      positions: solve.positions,
      tiles,
      sp,
      adjacency,
      viewport,
      gaze,
    },
    weights
  ).total

  let bestSp = sp
  let bestSolve = solve
  let bestCost = cost
  let bestIter = 0
  let iterations = 0

  // Cache cluster id-lists for the rotateCluster perturbation.
  const clusterIds = collectClusters(tiles)

  let T = config.initialT
  let plateauCounter = 0
  outer: while (T > config.finalT) {
    for (let i = 0; i < config.iterationsPerT; i++) {
      iterations++

      // Budget guard
      if (config.budgetMs != null && performance.now() - startMs > config.budgetMs) {
        break outer
      }

      const candidate = perturb(sp, clusterIds, config.rng)
      const candSolve = lpSolve(candidate, tiles, viewport, gutter)
      const candCost = costFn(
        {
          positions: candSolve.positions,
          tiles,
          sp: candidate,
          adjacency,
          viewport,
          gaze,
        },
        weights
      ).total

      const delta = candCost - cost
      const accept = delta <= 0 || config.rng() < Math.exp(-delta / Math.max(1e-9, T))
      if (accept) {
        sp = candidate
        solve = candSolve
        cost = candCost
      }

      if (cost < bestCost - 1e-6) {
        bestSp = sp
        bestSolve = solve
        bestCost = cost
        bestIter = iterations
        plateauCounter = 0
      } else {
        plateauCounter++
        if (plateauCounter >= config.plateauPatience) {
          plateauCounter = 0
          break // advance T
        }
      }
    }
    T *= config.cooling
  }

  return {
    sp: bestSp,
    positions: bestSolve.positions,
    totalHeight: bestSolve.totalHeight,
    feasible: bestSolve.feasible,
    cost: bestCost,
    iterations,
    bestIteration: bestIter,
  }
}

function perturb(
  sp: SequencePair,
  clusterIds: ReadonlyArray<readonly string[]>,
  rng: () => number
): SequencePair {
  const r = rng()
  // Mix:  50% swapInOne, 30% swapInBoth, 20% rotateCluster (if any cluster has ≥2 members).
  if (r < 0.5) return sp.swapInOne(rng)
  if (r < 0.8) return sp.swapInBoth(rng)
  if (clusterIds.length === 0) return sp.swapInOne(rng)
  const pick = clusterIds[Math.floor(rng() * clusterIds.length)]
  return sp.rotateCluster(pick, rng)
}

function collectClusters(tiles: readonly TileMeta[]): ReadonlyArray<readonly string[]> {
  const map = new Map<string, string[]>()
  for (const t of tiles) {
    if (!t.cluster) continue
    if (!map.has(t.cluster)) map.set(t.cluster, [])
    map.get(t.cluster)?.push(t.id)
  }
  return Array.from(map.values()).filter((c) => c.length >= 2)
}
