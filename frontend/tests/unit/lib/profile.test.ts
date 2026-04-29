import { describe, expect, test } from "vitest"
import {
  aboutText,
  contact,
  contactText,
  experience,
  experienceJson,
  projects,
  projectsJson,
  skills,
  skillsJson,
} from "$lib/profile"

describe("profile data", () => {
  test("exports contact channels used across site", () => {
    expect(contact.email).toContain("@")
    expect(contact.phone).toMatch(/^\+/)
    expect(contact.github).toContain("github.com")
    expect(contactText).toContain(contact.email)
    expect(contactText).toContain(contact.phone)
    expect(contactText).toContain(contact.github)
  })

  test("keeps skill categories and items non-empty", () => {
    expect(skills.length).toBeGreaterThan(0)

    for (const skill of skills) {
      expect(skill.category).not.toHaveLength(0)
      expect(skill.items.length).toBeGreaterThan(0)
      expect(skill.items.every((item) => item.length > 0)).toBe(true)
    }
  })

  test("keeps experience entries and derived json in sync", () => {
    expect(experience.length).toBeGreaterThan(0)

    for (const job of experience) {
      expect(job.company).not.toHaveLength(0)
      expect(job.title).not.toHaveLength(0)
      expect(job.highlights.length).toBeGreaterThan(0)
    }

    expect(JSON.parse(experienceJson)).toEqual(experience)
  })

  test("keeps project payloads and about text serializable", () => {
    expect(aboutText).toContain("backend architectures")
    expect(JSON.parse(skillsJson)).toEqual(
      skills.reduce(
        (acc, skill) => {
          acc[skill.category.toLowerCase()] = skill.items
          return acc
        },
        {} as Record<string, string[]>
      )
    )
    expect(JSON.parse(projectsJson)).toEqual(projects)
  })
})
