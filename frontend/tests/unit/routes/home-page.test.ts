import { fireEvent, render, screen, within } from "@testing-library/svelte"
import { describe, expect, test } from "vitest"
import HomePage from "../../../src/routes/+page.svelte"
import { MockIntersectionObserver } from "../../../src/test/browser-mocks"

describe("home page", () => {
  test("renders core landing sections", () => {
    render(HomePage)

    expect(screen.getByRole("heading", { name: "About" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Technical Skills" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Experience" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Side Projects" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Certifications" })).toBeInTheDocument()
  })

  test("opens and closes certificate modal", async () => {
    render(HomePage)

    await fireEvent.click(screen.getByRole("button", { name: /Ekahau ECSE Design/i }))

    const dialog = screen.getByRole("dialog")
    expect(within(dialog).getByTitle("Ekahau ECSE Certificate")).toHaveAttribute(
      "src",
      "/2019-ECSE-Certificate-ekahau-Vladimir_Kolchurin.pdf"
    )

    await fireEvent.click(dialog)

    expect(screen.queryByTitle("Ekahau ECSE Certificate")).not.toBeInTheDocument()
  })

  test("preloads certificate pdf when section intersects viewport", () => {
    render(HomePage)

    const certSection = screen.getByRole("heading", { name: "Certifications" }).closest("section")
    expect(certSection).not.toBeNull()
    expect(MockIntersectionObserver.instances).toHaveLength(1)

    MockIntersectionObserver.instances[0].trigger(certSection as HTMLElement)

    const preloadLink = document.head.querySelector(
      'link[href="/2019-ECSE-Certificate-ekahau-Vladimir_Kolchurin.pdf"]'
    ) as HTMLLinkElement | null

    expect(preloadLink).not.toBeNull()
    expect(preloadLink?.rel).toBe("preload")
    expect(MockIntersectionObserver.instances[0].disconnect).toHaveBeenCalledTimes(1)
  })
})
