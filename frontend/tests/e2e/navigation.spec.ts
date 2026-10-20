import { expect, test } from "@playwright/test"

test.describe("layout navigation", () => {
  test("navigates between alternate layouts", async ({ page }) => {
    await page.goto("/")

    const gridWarning = page.getByRole("dialog", { name: "Experimental Territory" })

    await page.locator('a[href="/grid"]').click()
    await expect(gridWarning).toBeVisible()
    await page.getByRole("button", { name: "Here be dragons..." }).click()
    await expect(page).toHaveURL(/\/grid$/)
    await expect(page.getByRole("heading", { name: "Experience" })).toBeVisible()
    await expect(page.locator('a[href="/grid"]')).toHaveClass(/active/)

    await page.locator('a[href="/grid-v2"]').click()
    await expect(gridWarning).toBeVisible()
    await page.getByRole("button", { name: "Here be dragons..." }).click()
    await expect(page).toHaveURL(/\/grid-v2$/)
    await expect(page.getByRole("heading", { name: "Technical Skills" })).toBeVisible()
    await expect(page.locator('a[href="/grid-v2"]')).toHaveClass(/active/)

    // The bento layout replaces the old grid-v4 slot and is experimental too.
    await page.locator('a[href="/bento"]').click()
    await expect(gridWarning).toBeVisible()
    await page.getByRole("button", { name: "Here be dragons..." }).click()
    await expect(page).toHaveURL(/\/bento$/)
    await expect(page.locator(".bento-container")).toBeAttached()
    await expect(page.locator('a[href="/bento"]')).toHaveClass(/active/)
  })

  test("redirects the old /grid-v4 url to the bento layout", async ({ page }) => {
    await page.goto("/grid-v4")
    await expect(page).toHaveURL(/\/bento$/)
    await expect(page.locator(".bento-container")).toBeAttached()
  })
})
