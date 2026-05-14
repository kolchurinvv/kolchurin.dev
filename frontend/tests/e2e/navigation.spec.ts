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
  })
})
