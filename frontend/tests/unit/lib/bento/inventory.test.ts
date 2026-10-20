import { describe, expect, it } from "vitest"
import { BENTO_ADJACENCY, BENTO_TILES } from "$lib/bento/inventory"
import type { Tier } from "$lib/bento/types"

describe("BENTO_TILES inventory", () => {
  it("has exactly 15 tiles", () => {
    expect(BENTO_TILES).toHaveLength(15)
  })

  it("has the expected tier distribution (1 / 2 / 9 / 3)", () => {
    const counts: Record<Tier, number> = {
      primary: 0,
      secondary: 0,
      tertiary: 0,
      quaternary: 0,
    }
    for (const t of BENTO_TILES) counts[t.priority]++
    expect(counts).toEqual({ primary: 1, secondary: 2, tertiary: 9, quaternary: 3 })
  })

  it("has the terminal as the only primary tile", () => {
    const primaries = BENTO_TILES.filter((t) => t.priority === "primary")
    expect(primaries.map((t) => t.id)).toEqual(["terminal"])
  })

  it("has unique tile ids", () => {
    const ids = BENTO_TILES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  describe("skills cluster", () => {
    const skills = BENTO_TILES.filter((t) => t.cluster === "skills")

    it("has 5 members with clusterOrder 1..5", () => {
      expect(skills).toHaveLength(5)
      const orders = skills.map((t) => t.clusterOrder).sort()
      expect(orders).toEqual([1, 2, 3, 4, 5])
    })

    it("all members are tertiary", () => {
      for (const t of skills) expect(t.priority).toBe("tertiary")
    })
  })

  describe("projects cluster", () => {
    const projects = BENTO_TILES.filter((t) => t.cluster === "projects")

    it("has 3 members with clusterOrder 1..3", () => {
      expect(projects).toHaveLength(3)
      const orders = projects.map((t) => t.clusterOrder).sort()
      expect(orders).toEqual([1, 2, 3])
    })

    it("currently-building is first in cluster order", () => {
      const first = projects.find((t) => t.clusterOrder === 1)
      expect(first?.id).toBe("projects-currently-building")
    })

    it("all members are tertiary", () => {
      for (const t of projects) expect(t.priority).toBe("tertiary")
    })
  })

  describe("quaternary placement flags", () => {
    it("status-badge has placement: feature", () => {
      const badge = BENTO_TILES.find((t) => t.id === "status-badge")
      expect(badge?.placement).toBe("feature")
      expect(badge?.priority).toBe("quaternary")
    })

    it("certs and footer have placement: fill", () => {
      const certs = BENTO_TILES.find((t) => t.id === "certs")
      const footer = BENTO_TILES.find((t) => t.id === "footer")
      expect(certs?.placement).toBe("fill")
      expect(footer?.placement).toBe("fill")
    })
  })

  it("every tile has min ≤ ideal ≤ max in its aspect band", () => {
    for (const t of BENTO_TILES) {
      if (!t.aspectRatio) continue
      const { min, ideal, max } = t.aspectRatio
      expect(min, `${t.id} min ≤ ideal`).toBeLessThanOrEqual(ideal)
      expect(ideal, `${t.id} ideal ≤ max`).toBeLessThanOrEqual(max)
    }
  })
})

describe("BENTO_ADJACENCY hints", () => {
  it("has 16 expanded rows", () => {
    expect(BENTO_ADJACENCY).toHaveLength(16)
  })

  it("references only real tile ids", () => {
    const ids = new Set(BENTO_TILES.map((t) => t.id))
    for (const hint of BENTO_ADJACENCY) {
      expect(ids.has(hint.a), `unknown a: ${hint.a}`).toBe(true)
      expect(ids.has(hint.b), `unknown b: ${hint.b}`).toBe(true)
    }
  })

  it("has positive weights", () => {
    for (const hint of BENTO_ADJACENCY) {
      expect(hint.weight).toBeGreaterThan(0)
    }
  })

  it("no self-loops", () => {
    for (const hint of BENTO_ADJACENCY) {
      expect(hint.a).not.toBe(hint.b)
    }
  })
})
