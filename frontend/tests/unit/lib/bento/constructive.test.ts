import { describe, expect, it } from "vitest"
import { constructivePack } from "$lib/bento/constructive"
import { BENTO_TILES } from "$lib/bento/inventory"
import type { Position } from "$lib/bento/types"

// Deterministic fake content-height (the real one DOM-measures). Varies by width
// so spanning tiles get a different height than 1-col tiles.
const fakeHeight = (id: string, w: number): number => 120 + id.length * 7 + Math.round(w / 10)

function pack(w: number) {
  return constructivePack({
    tiles: BENTO_TILES,
    viewport: { w, h: 900 },
    gutter: 12,
    contentHeight: fakeHeight,
  })
}

function overlaps(a: Position, b: Position): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
}

describe("constructivePack", () => {
  it("places every tile with a positive size, inside the width", () => {
    const r = pack(1440)
    expect(r.positions).toHaveLength(BENTO_TILES.length)
    for (const p of r.positions) {
      expect(p.w).toBeGreaterThan(0)
      expect(p.h).toBeGreaterThan(0)
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.x + p.w).toBeLessThanOrEqual(1440 + 0.5)
    }
    expect(r.totalHeight).toBeGreaterThan(0)
  })

  it("produces no overlapping tiles", () => {
    const { positions } = pack(1440)
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        expect(
          overlaps(positions[i], positions[j]),
          `${positions[i].id} overlaps ${positions[j].id}`
        ).toBe(false)
      }
    }
  })

  it("is deterministic for identical input", () => {
    const a = JSON.stringify(pack(1440).positions)
    const b = JSON.stringify(pack(1440).positions)
    expect(a).toBe(b)
  })

  it("keeps the skills cluster cohesive: 2 adjacent columns, peer width", () => {
    const { positions } = pack(1440)
    const ids = ["skills-backend", "skills-cloud", "skills-networking", "skills-ai"]
    const skills = positions.filter((p) => ids.includes(p.id))
    expect(skills).toHaveLength(4)
    // peer (uniform) width — heights vary and sub-columns nestle independently
    expect(new Set(skills.map((s) => s.w)).size).toBe(1)
    // grouped: members occupy at most 2 distinct columns (the cluster's span)
    expect(new Set(skills.map((s) => s.x)).size).toBeLessThanOrEqual(2)
  })

  it("packs reasonably tightly (low dead space)", () => {
    const r = pack(1440)
    const cover = r.positions.reduce((s, p) => s + p.w * p.h, 0)
    const dead = 1 - cover / (1440 * r.totalHeight)
    expect(dead).toBeLessThan(0.45)
  })
})
