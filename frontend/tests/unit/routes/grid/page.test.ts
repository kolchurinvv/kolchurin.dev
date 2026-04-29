import { render, screen } from "@testing-library/svelte"
import { describe, expect, test } from "vitest"
import GridPage from "../../../../src/routes/grid/+page.svelte"

describe("grid page", () => {
  test("renders layout cells for major sections", () => {
    render(GridPage)

    expect(document.querySelectorAll(".grid-cell").length).toBeGreaterThan(0)
    expect(screen.getByRole("heading", { name: "Experience" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Technical Skills" })).toBeInTheDocument()
  })

  test("renders interactive terminal and contact links", () => {
    render(GridPage)

    expect(screen.getByRole("textbox")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /github.com\/kolchurinvv/i })).toHaveAttribute(
      "href",
      "https://github.com/kolchurinvv"
    )
  })
})
