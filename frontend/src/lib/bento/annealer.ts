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
      gutter,
    },
    weights
  ).total

  let bestSp = sp
  let bestSolve = solve
  let bestCost = cost
  let bestIter = 0
  let iterations = 0

  // Cluster membership for the contiguity-preserving perturbations.
  const { clusterOf, clusterKeys } = clusterInfo(tiles)

  let T = config.initialT
  let plateauCounter = 0
  outer: while (T > config.finalT) {
    for (let i = 0; i < config.iterationsPerT; i++) {
      iterations++

      // Stop on a FIXED iteration count, never wall-clock — a time budget runs a
      // different number of iterations per machine/load, which makes the layout
      // non-deterministic for the same seed+width. maxIterations keeps it stable.
      if (config.maxIterations != null && iterations > config.maxIterations) {
        break outer
      }

      const candidate = perturb(sp, clusterOf, clusterKeys, config.rng)
      const candSolve = lpSolve(candidate, tiles, viewport, gutter)
      const candCost = costFn(
        {
          positions: candSolve.positions,
          tiles,
          sp: candidate,
          adjacency,
          viewport,
          gaze,
          gutter,
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

// ── cluster-contiguity-preserving perturbations ───────────────────────────
// Every move below keeps each cluster a CONTIGUOUS run in BOTH sequences (it is
// so in the fromTierMajor seed). Contiguity in both ⇒ the cluster is a spatially
// separable block, so members can never drift apart — cohesion is structural,
// not a soft cost the search can violate. The cluster's SHAPE (internal order)
// and POSITION (unit order) stay free, so it can still take a row / L / T to
// fill voids.

type ClusterMap = Map<string, string> // tileId → clusterId (only clustered tiles)

/** Split a sequence into units: each non-clustered tile, and each cluster's
 *  contiguous run, is one unit. */
function splitUnits(seq: readonly string[], clusterOf: ClusterMap): string[][] {
  const units: string[][] = []
  let i = 0
  while (i < seq.length) {
    const c = clusterOf.get(seq[i])
    if (c === undefined) {
      units.push([seq[i]])
      i++
      continue
    }
    const run: string[] = []
    while (i < seq.length && clusterOf.get(seq[i]) === c) {
      run.push(seq[i])
      i++
    }
    units.push(run)
  }
  return units
}

const unitKey = (unit: string[], clusterOf: ClusterMap): string => clusterOf.get(unit[0]) ?? unit[0]

function twoDistinct(n: number, rng: () => number): [number, number] {
  const a = Math.floor(rng() * n)
  let b = Math.floor(rng() * n)
  while (b === a) b = Math.floor(rng() * n)
  return [a, b]
}

/** Swap two whole units within one sequence (clusters move as a block). */
function swapUnitsInSeq(seq: readonly string[], clusterOf: ClusterMap, rng: () => number): string[] {
  const units = splitUnits(seq, clusterOf)
  if (units.length < 2) return seq.slice()
  const [a, b] = twoDistinct(units.length, rng)
  ;[units[a], units[b]] = [units[b], units[a]]
  return units.flat()
}

/** Swap the same two units (by identity) in BOTH sequences — moves a tile's or a
 *  whole cluster's overall position. */
function swapUnitsBoth(sp: SequencePair, clusterOf: ClusterMap, rng: () => number): SequencePair {
  const up = splitUnits(sp.gammaPlus, clusterOf)
  const um = splitUnits(sp.gammaMinus, clusterOf)
  if (up.length < 2) return sp
  const keys = up.map((u) => unitKey(u, clusterOf))
  const [a, b] = twoDistinct(keys.length, rng)
  const swapByKey = (units: string[][], keyA: string, keyB: string) => {
    const ia = units.findIndex((u) => unitKey(u, clusterOf) === keyA)
    const ib = units.findIndex((u) => unitKey(u, clusterOf) === keyB)
    if (ia >= 0 && ib >= 0) [units[ia], units[ib]] = [units[ib], units[ia]]
  }
  swapByKey(up, keys[a], keys[b])
  swapByKey(um, keys[a], keys[b])
  return new SequencePair(up.flat(), um.flat())
}

/** Reorder two members WITHIN a cluster's run in one sequence — changes the
 *  cluster's internal shape (row ↔ L ↔ square) while staying contiguous. */
function reshapeClusterInSeq(
  seq: readonly string[],
  clusterId: string,
  clusterOf: ClusterMap,
  rng: () => number
): string[] {
  const idxs: number[] = []
  for (let i = 0; i < seq.length; i++) if (clusterOf.get(seq[i]) === clusterId) idxs.push(i)
  if (idxs.length < 2) return seq.slice()
  const out = seq.slice()
  const [a, b] = twoDistinct(idxs.length, rng)
  ;[out[idxs[a]], out[idxs[b]]] = [out[idxs[b]], out[idxs[a]]]
  return out
}

function perturb(
  sp: SequencePair,
  clusterOf: ClusterMap,
  clusterKeys: readonly string[],
  rng: () => number
): SequencePair {
  const r = rng()
  if (r < 0.3) return new SequencePair(swapUnitsInSeq(sp.gammaPlus, clusterOf, rng), sp.gammaMinus)
  if (r < 0.6) return new SequencePair(sp.gammaPlus, swapUnitsInSeq(sp.gammaMinus, clusterOf, rng))
  if (r < 0.8 || clusterKeys.length === 0) return swapUnitsBoth(sp, clusterOf, rng)
  const pick = clusterKeys[Math.floor(rng() * clusterKeys.length)]
  return rng() < 0.5
    ? new SequencePair(reshapeClusterInSeq(sp.gammaPlus, pick, clusterOf, rng), sp.gammaMinus)
    : new SequencePair(sp.gammaPlus, reshapeClusterInSeq(sp.gammaMinus, pick, clusterOf, rng))
}

function clusterInfo(tiles: readonly TileMeta[]): { clusterOf: ClusterMap; clusterKeys: string[] } {
  const clusterOf: ClusterMap = new Map()
  const counts = new Map<string, number>()
  for (const t of tiles) {
    if (!t.cluster) continue
    clusterOf.set(t.id, t.cluster)
    counts.set(t.cluster, (counts.get(t.cluster) ?? 0) + 1)
  }
  const clusterKeys = [...counts.entries()].filter(([, n]) => n >= 2).map(([k]) => k)
  return { clusterOf, clusterKeys }
}
