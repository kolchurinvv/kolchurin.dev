import { fireEvent, render, screen, within } from "@testing-library/svelte"
import { describe, expect, test } from "vitest"
import GridV2Page from "../../../../src/routes/grid-v2/+page.svelte"

describe("grid-v2 page", () => {
  test("renders masonry sections", () => {
    render(GridV2Page)

    expect(document.querySelectorAll(".masonry-item").length).toBeGreaterThan(0)
    expect(screen.getByRole("heading", { name: "Experience" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Technical Skills" })).toBeInTheDocument()
  })

  test("opens certificate modal", async () => {
    render(GridV2Page)

    await fireEvent.click(screen.getByRole("button", { name: /Ekahau ECSE Design/i }))

    const dialog = screen.getByRole("dialog")
    expect(within(dialog).getByTitle("Ekahau ECSE Certificate")).toBeInTheDocument()
  })
})
