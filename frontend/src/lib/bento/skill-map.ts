/**
 * Maps a `profile.skills` category name onto its bento tile id.
 *
 * Every category in `profile.skills` MUST have an entry here, and every id MUST
 * exist in BENTO_TILES. A missing entry makes the /bento page look up
 * `meta[undefined].aspectRatio` during SSR, which throws and turns the whole
 * route into a 500. `skill-map.test.ts` enforces both directions so the drift
 * fails in unit tests instead of at request time.
 */
export const SKILL_CATEGORY_TILE_IDS: Record<string, string> = {
  "Backend & Databases": "skills-backend",
  "Cloud & DevOps": "skills-cloud",
  "Networking & Systems": "skills-networking",
  "AI Infrastructure": "skills-ai",
  "AI-Assisted Engineering": "skills-ai-assisted",
}
