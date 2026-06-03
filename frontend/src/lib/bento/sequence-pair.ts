/**
 * Sequence-pair representation (Murata et al., 1995) for non-guillotine packing.
 *
 * A sequence pair (Γ⁺, Γ⁻) over tile ids encodes pairwise spatial relations:
 *   - i is LEFT  of j ⇔ i precedes j in BOTH Γ⁺ and Γ⁻
 *   - i is ABOVE of j ⇔ i precedes j in Γ⁺ AND j precedes i in Γ⁻
 *
 * Together with the symmetric cases (right-of, below) this covers every pair —
 * every layout topology has exactly one corresponding sequence pair (up to the
 * usual ambiguity for non-adjacent tiles).
 */

import { randomInt, shuffle } from "./rng"
import type { SequencePairData, Tier, TileMeta } from "./types"

const TIER_ORDER: Tier[] = ["primary", "secondary", "tertiary", "quaternary"]

export class SequencePair {
  constructor(
    public readonly gammaPlus: readonly string[],
    public readonly gammaMinus: readonly string[]
  ) {
    if (gammaPlus.length !== gammaMinus.length) {
      throw new Error("SequencePair: gamma sequences must have equal length")
    }
  }

  get size(): number {
    return this.gammaPlus.length
  }

  toData(): SequencePairData {
    return { gammaPlus: this.gammaPlus.slice(), gammaMinus: this.gammaMinus.slice() }
  }

  static fromData(data: SequencePairData): SequencePair {
    return new SequencePair(data.gammaPlus.slice(), data.gammaMinus.slice())
  }

  static fromRandom(ids: readonly string[], rng: () => number): SequencePair {
    return new SequencePair(shuffle(ids, rng), shuffle(ids, rng))
  }

  static fromTierMajor(tiles: readonly TileMeta[], rng: () => number): SequencePair {
    const byTier: Record<Tier, string[]> = {
      primary: [],
      secondary: [],
      tertiary: [],
      quaternary: [],
    }
    for (const t of tiles) byTier[t.priority].push(t.id)
    const ordered: string[] = []
    for (const tier of TIER_ORDER) ordered.push(...shuffle(byTier[tier], rng))
    return new SequencePair(ordered, shuffle(ordered, rng))
  }

  /**
   * Directed edges i → j meaning j is to the right of i (i.e. i LEFT-of j).
   */
  horizontalEdges(): Array<[string, string]> {
    const plusIdx = indexMap(this.gammaPlus)
    const minusIdx = indexMap(this.gammaMinus)
    const edges: Array<[string, string]> = []
    for (const a of this.gammaPlus) {
      for (const b of this.gammaPlus) {
        if (a === b) continue
        if (plusIdx[a] < plusIdx[b] && minusIdx[a] < minusIdx[b]) {
          edges.push([a, b])
        }
      }
    }
    return edges
  }

  /**
   * Directed edges i → j meaning j is below i (i.e. i ABOVE-of j).
   */
  verticalEdges(): Array<[string, string]> {
    const plusIdx = indexMap(this.gammaPlus)
    const minusIdx = indexMap(this.gammaMinus)
    const edges: Array<[string, string]> = []
    for (const a of this.gammaPlus) {
      for (const b of this.gammaPlus) {
        if (a === b) continue
        if (plusIdx[a] < plusIdx[b] && minusIdx[a] > minusIdx[b]) {
          edges.push([a, b])
        }
      }
    }
    return edges
  }

  /**
   * For each tile id, the set of tiles directly adjacent in either H or V topology.
   * "Direct" = transitive reduction of the union of H and V graphs.
   *
   * This approximates spatial adjacency well enough for cost-function neighborhood
   * computations. The actual rendered rectangles' shared-edge relation can be
   * computed separately from positions when needed.
   */
  neighbors(): Map<string, Set<string>> {
    const map = new Map<string, Set<string>>()
    for (const id of this.gammaPlus) map.set(id, new Set())

    const h = transitiveReduction(this.gammaPlus, this.horizontalEdges())
    const v = transitiveReduction(this.gammaPlus, this.verticalEdges())

    for (const [a, b] of h.concat(v)) {
      map.get(a)?.add(b)
      map.get(b)?.add(a)
    }
    return map
  }

  // ─── perturbation operators (return new SP, immutable) ─────────────

  /** Swap two random positions in one of Γ⁺ / Γ⁻ at random. */
  swapInOne(rng: () => number): SequencePair {
    const which = rng() < 0.5 ? "plus" : "minus"
    const arr = (which === "plus" ? this.gammaPlus : this.gammaMinus).slice()
    if (arr.length < 2) return this
    const i = randomInt(rng, 0, arr.length)
    let j = randomInt(rng, 0, arr.length)
    while (j === i) j = randomInt(rng, 0, arr.length)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    return which === "plus"
      ? new SequencePair(arr, this.gammaMinus)
      : new SequencePair(this.gammaPlus, arr)
  }

  /** Swap the same id-pair in BOTH Γ⁺ and Γ⁻. */
  swapInBoth(rng: () => number): SequencePair {
    if (this.gammaPlus.length < 2) return this
    const i = randomInt(rng, 0, this.gammaPlus.length)
    let j = randomInt(rng, 0, this.gammaPlus.length)
    while (j === i) j = randomInt(rng, 0, this.gammaPlus.length)
    const a = this.gammaPlus[i]
    const b = this.gammaPlus[j]
    return new SequencePair(swapIds(this.gammaPlus, a, b), swapIds(this.gammaMinus, a, b))
  }

  /**
   * Rotate the positions occupied by `clusterIds` cyclically by 1.
   * Preserves where the cluster sits relative to non-cluster tiles, but
   * shuffles the cluster's internal arrangement. Useful for escaping local
   * minima during simulated annealing.
   */
  rotateCluster(clusterIds: readonly string[], _rng: () => number): SequencePair {
    if (clusterIds.length < 2) return this
    return new SequencePair(
      rotateAtPositions(this.gammaPlus, clusterIds),
      rotateAtPositions(this.gammaMinus, clusterIds)
    )
  }
}

// ─── helpers ──────────────────────────────────────────────────────────

function indexMap(seq: readonly string[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (let i = 0; i < seq.length; i++) out[seq[i]] = i
  return out
}

function swapIds(seq: readonly string[], a: string, b: string): string[] {
  const out = seq.slice()
  const ia = out.indexOf(a)
  const ib = out.indexOf(b)
  if (ia >= 0 && ib >= 0) {
    out[ia] = b
    out[ib] = a
  }
  return out
}

function rotateAtPositions(seq: readonly string[], targetIds: readonly string[]): string[] {
  const targetSet = new Set(targetIds)
  const positions: number[] = []
  const tilesAtPositions: string[] = []
  for (let i = 0; i < seq.length; i++) {
    if (targetSet.has(seq[i])) {
      positions.push(i)
      tilesAtPositions.push(seq[i])
    }
  }
  if (positions.length < 2) return seq.slice()
  const rotated = [tilesAtPositions[tilesAtPositions.length - 1], ...tilesAtPositions.slice(0, -1)]
  const out = seq.slice()
  for (let k = 0; k < positions.length; k++) out[positions[k]] = rotated[k]
  return out
}

/**
 * Transitive reduction of a DAG: keep only edges (a,b) that are NOT implied
 * by some longer path a → c → … → b. Used to derive "spatial-adjacency"
 * neighbor relations from the transitively-closed H/V graphs that sequence-
 * pair decoding produces. O(V·E) for the small N we deal with.
 */
function transitiveReduction(
  ids: readonly string[],
  edges: ReadonlyArray<[string, string]>
): Array<[string, string]> {
  const succ = new Map<string, Set<string>>()
  for (const id of ids) succ.set(id, new Set())
  for (const [a, b] of edges) succ.get(a)?.add(b)

  function reaches(from: string, to: string): boolean {
    if (from === to) return true
    const visited = new Set<string>()
    const stack: string[] = [from]
    while (stack.length > 0) {
      const cur = stack.pop()
      if (!cur) continue
      for (const nxt of succ.get(cur) ?? []) {
        if (nxt === to) return true
        if (visited.has(nxt)) continue
        visited.add(nxt)
        stack.push(nxt)
      }
    }
    return false
  }

  return edges.filter(([a, b]) => {
    // Edge (a,b) is redundant iff some other direct successor c of a can reach b.
    for (const c of succ.get(a) ?? []) {
      if (c === b) continue
      if (reaches(c, b)) return false
    }
    return true
  })
}
