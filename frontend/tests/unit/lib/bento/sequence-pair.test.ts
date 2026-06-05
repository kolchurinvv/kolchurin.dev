import { describe, expect, it } from "vitest"
import { mulberry32 } from "$lib/bento/rng"
import { SequencePair } from "$lib/bento/sequence-pair"
import type { TileMeta } from "$lib/bento/types"

describe("SequencePair", () => {
  describe("hand-crafted 4-tile case", () => {
    // Convention:
    //   left-of(i, j) ⇔ i precedes j in BOTH Γ⁺ and Γ⁻
    //   above-of(i, j) ⇔ i precedes j in Γ⁺ AND j precedes i in Γ⁻
    //
    // SP1: Γ⁺ = [a, b, c, d], Γ⁻ = [a, b, c, d]
    //   → every pair is left-of (a is left of all; b is left of c,d; c is left of d)
    //   → no vertical pairs
    const sp1 = new SequencePair(["a", "b", "c", "d"], ["a", "b", "c", "d"])

    it("yields 6 left-of pairs and 0 above-of pairs when sequences match", () => {
      expect(new Set(sp1.horizontalEdges().map((e) => e.join("→"))).size).toBe(6)
      expect(sp1.verticalEdges()).toHaveLength(0)
    })

    // SP2: Γ⁺ = [a, b, c, d], Γ⁻ = [d, c, b, a]
    //   → every pair: a precedes b/c/d in Γ⁺; in Γ⁻ a is AFTER each
    //   → a is above b/c/d, b is above c/d, c is above d
    //   → no horizontal pairs
    const sp2 = new SequencePair(["a", "b", "c", "d"], ["d", "c", "b", "a"])

    it("yields 0 left-of pairs and 6 above-of pairs when sequences are reversed", () => {
      expect(sp2.horizontalEdges()).toHaveLength(0)
      expect(new Set(sp2.verticalEdges().map((e) => e.join("→"))).size).toBe(6)
    })

    // SP3: 2x2 grid topology
    //   a b
    //   c d
    // Convention check:
    //   a left-of b, c left-of d   → a precedes b in Γ⁺ and Γ⁻; c precedes d likewise.
    //   a above c, b above d       → a precedes c in Γ⁺, c precedes a in Γ⁻.
    // Try Γ⁺ = [a, b, c, d], Γ⁻ = [c, a, d, b].
    //   a vs b: a < b in Γ⁺, a < b in Γ⁻ → a left-of b ✓
    //   c vs d: c < d in Γ⁺, c < d in Γ⁻ → c left-of d ✓
    //   a vs c: a < c in Γ⁺, a > c in Γ⁻ → a above c ✓
    //   b vs d: b < d in Γ⁺, b > d in Γ⁻ → b above d ✓
    //   a vs d: a < d in Γ⁺, a > d in Γ⁻ → a above d (transitive via c) ✓
    //   b vs c: b < c in Γ⁺, b > c in Γ⁻ → b above c (transitive via a's row? actually this is the topology where b is upper-right and c is lower-left — b is above c is correct)
    const sp3 = new SequencePair(["a", "b", "c", "d"], ["c", "a", "d", "b"])

    it("encodes a 2×2 grid as expected", () => {
      const hSet = new Set(sp3.horizontalEdges().map((e) => e.join("→")))
      const vSet = new Set(sp3.verticalEdges().map((e) => e.join("→")))
      expect(hSet.has("a→b")).toBe(true)
      expect(hSet.has("c→d")).toBe(true)
      expect(vSet.has("a→c")).toBe(true)
      expect(vSet.has("b→d")).toBe(true)
    })
  })

  describe("determinism", () => {
    it("fromRandom returns identical SP for the same seed", () => {
      const ids = ["a", "b", "c", "d", "e"]
      const sp1 = SequencePair.fromRandom(ids, mulberry32(42))
      const sp2 = SequencePair.fromRandom(ids, mulberry32(42))
      expect(sp1.gammaPlus).toEqual(sp2.gammaPlus)
      expect(sp1.gammaMinus).toEqual(sp2.gammaMinus)
    })

    it("fromTierMajor returns identical SP for the same seed", () => {
      const tiles: TileMeta[] = [
        { id: "a", priority: "primary", minW: 100, minH: 100 },
        { id: "b", priority: "secondary", minW: 100, minH: 100 },
        { id: "c", priority: "tertiary", minW: 100, minH: 100 },
        { id: "d", priority: "tertiary", minW: 100, minH: 100 },
      ]
      const sp1 = SequencePair.fromTierMajor(tiles, mulberry32(123))
      const sp2 = SequencePair.fromTierMajor(tiles, mulberry32(123))
      expect(sp1.gammaPlus).toEqual(sp2.gammaPlus)
      expect(sp1.gammaMinus).toEqual(sp2.gammaMinus)
    })

    it("fromTierMajor places primary first in Γ⁺", () => {
      const tiles: TileMeta[] = [
        { id: "q", priority: "quaternary", minW: 100, minH: 100 },
        { id: "p", priority: "primary", minW: 100, minH: 100 },
        { id: "s", priority: "secondary", minW: 100, minH: 100 },
      ]
      const sp = SequencePair.fromTierMajor(tiles, mulberry32(1))
      expect(sp.gammaPlus[0]).toBe("p")
    })
  })

  describe("perturbation operators", () => {
    const ids = ["a", "b", "c", "d", "e"]
    const sp = SequencePair.fromRandom(ids, mulberry32(7))

    it("swapInOne preserves the id set", () => {
      const sp2 = sp.swapInOne(mulberry32(11))
      expect(new Set(sp2.gammaPlus)).toEqual(new Set(ids))
      expect(new Set(sp2.gammaMinus)).toEqual(new Set(ids))
    })

    it("swapInBoth preserves the id set in both arrays", () => {
      const sp2 = sp.swapInBoth(mulberry32(11))
      expect(new Set(sp2.gammaPlus)).toEqual(new Set(ids))
      expect(new Set(sp2.gammaMinus)).toEqual(new Set(ids))
    })

    it("swapInBoth swaps the same two ids in both arrays", () => {
      const sp2 = sp.swapInBoth(mulberry32(11))
      // For every id, its position changed in BOTH arrays or NEITHER
      for (const id of ids) {
        const movedPlus = sp.gammaPlus.indexOf(id) !== sp2.gammaPlus.indexOf(id)
        const movedMinus = sp.gammaMinus.indexOf(id) !== sp2.gammaMinus.indexOf(id)
        expect(movedPlus).toBe(movedMinus)
      }
    })

    it("rotateCluster preserves the id set", () => {
      const sp2 = sp.rotateCluster(["a", "b"], mulberry32(1))
      expect(new Set(sp2.gammaPlus)).toEqual(new Set(ids))
      expect(new Set(sp2.gammaMinus)).toEqual(new Set(ids))
    })

    it("rotateCluster of singleton is a no-op", () => {
      const sp2 = sp.rotateCluster(["a"], mulberry32(1))
      expect(sp2.gammaPlus).toEqual(sp.gammaPlus)
      expect(sp2.gammaMinus).toEqual(sp.gammaMinus)
    })
  })

  describe("neighbors (transitive reduction of H ∪ V)", () => {
    it("for a horizontal line a—b—c, b neighbors both a and c but a does not neighbor c directly", () => {
      // Γ⁺ = [a, b, c], Γ⁻ = [a, b, c] → a < b < c left-of chain
      const sp = new SequencePair(["a", "b", "c"], ["a", "b", "c"])
      const n = sp.neighbors()
      expect(n.get("b")?.has("a")).toBe(true)
      expect(n.get("b")?.has("c")).toBe(true)
      // a→c should be eliminated by transitive reduction (a→b→c)
      expect(n.get("a")?.has("c")).toBe(false)
    })

    it("is symmetric", () => {
      const ids = ["a", "b", "c", "d", "e"]
      const sp = SequencePair.fromRandom(ids, mulberry32(99))
      const n = sp.neighbors()
      for (const a of ids) {
        for (const b of n.get(a) ?? []) {
          expect(n.get(b)?.has(a), `${b} should neighbor ${a}`).toBe(true)
        }
      }
    })
  })

  describe("toData / fromData round-trip", () => {
    it("preserves both sequences", () => {
      const sp = SequencePair.fromRandom(["a", "b", "c"], mulberry32(3))
      const data = sp.toData()
      const sp2 = SequencePair.fromData(data)
      expect(sp2.gammaPlus).toEqual(sp.gammaPlus)
      expect(sp2.gammaMinus).toEqual(sp.gammaMinus)
    })

    it("toData produces fresh arrays (mutation-safe)", () => {
      const sp = SequencePair.fromRandom(["a", "b"], mulberry32(3))
      const data = sp.toData()
      data.gammaPlus[0] = "ZZZ"
      expect(sp.gammaPlus[0]).not.toBe("ZZZ")
    })
  })
})
