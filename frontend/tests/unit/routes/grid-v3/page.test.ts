import { render, screen } from "@testing-library/svelte"
import { describe, expect, test } from "vitest"
import GridV3Page from "../../../../src/routes/grid-v3/+page.svelte"

describe("grid-v3 page", () => {
  test("renders priority focus grid", () => {
    render(GridV3Page)

    expect(document.querySelectorAll(".focus-card").length).toBe(8)
    expect(screen.getByRole("heading", { name: "Experience" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Technical Skills" })).toBeInTheDocument()
  })

  test("keeps terminal interactive", () => {
    render(GridV3Page)

    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })
})
