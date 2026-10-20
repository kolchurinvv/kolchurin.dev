import { describe, expect, it } from "vitest"
import { BENTO_TILES } from "$lib/bento/inventory"
import { SKILL_CATEGORY_TILE_IDS } from "$lib/bento/skill-map"
import { skills } from "$lib/profile"

// Regression guard. Adding a category to profile.skills without a tile id here
// made /bento resolve meta[undefined].aspectRatio and throw during SSR — a 500
// on the live route that only surfaced via e2e, weeks later.
describe("skill category → bento tile mapping", () => {
  it("maps every profile skill category to a tile id", () => {
    for (const group of skills) {
      expect(
        SKILL_CATEGORY_TILE_IDS[group.category],
        `profile.skills category "${group.category}" has no entry in SKILL_CATEGORY_TILE_IDS`
      ).toBeDefined()
    }
  })

  it("maps only to ids that exist in BENTO_TILES", () => {
    const tileIds = new Set(BENTO_TILES.map((t) => t.id))
    for (const [category, id] of Object.entries(SKILL_CATEGORY_TILE_IDS)) {
      expect(tileIds.has(id), `"${category}" maps to unknown tile id "${id}"`).toBe(true)
    }
  })

  it("has no stale entries for categories that no longer exist", () => {
    const categories = new Set(skills.map((g) => g.category))
    for (const category of Object.keys(SKILL_CATEGORY_TILE_IDS)) {
      expect(categories.has(category), `stale mapping for removed category "${category}"`).toBe(
        true
      )
    }
  })

  it("has one skills-cluster tile per profile category", () => {
    const clusterTiles = BENTO_TILES.filter((t) => t.cluster === "skills")
    expect(clusterTiles).toHaveLength(skills.length)
  })
})
