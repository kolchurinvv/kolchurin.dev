import { expect, test, type Page } from "@playwright/test"

async function waitForLayout(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const c = document.querySelector(".bento-container") as HTMLElement | null
      return c?.dataset.ready === "yes"
    },
    { timeout: 5000 }
  )
}

test.describe("/bento route", () => {
  test("renders 14 tiles at desktop width", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/bento")
    await waitForLayout(page)

    const tiles = page.locator("[data-tile]")
    await expect(tiles).toHaveCount(14)

    await expect(page.locator('[data-tile="terminal"]')).toBeVisible()
    await expect(page.locator('[data-tile="status-badge"]')).toBeVisible()
  })

  test("uses boring stack on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 900 })
    await page.goto("/bento")

    const mode = await page.locator(".bento-container").getAttribute("data-mode")
    expect(["boring", "measuring"]).toContain(mode)

    // 14 tiles still present
    await expect(page.locator("[data-tile]")).toHaveCount(14)
  })

  test("terminal cat current.md surfaces the currently-building copy", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/bento")
    await waitForLayout(page)

    const terminalInput = page.locator(".terminal .hidden-input")
    await terminalInput.fill("cat current.md")
    await terminalInput.press("Enter")

    // Scope to the terminal's output region (substring also appears in the
    // standalone Currently Building tile, hence the explicit container).
    await expect(page.locator(".terminal").getByText("3-VPS k3s mesh + Headscale")).toBeVisible()
  })
})
