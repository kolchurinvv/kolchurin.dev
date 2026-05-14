import { expect, test } from "@playwright/test"

test.describe("dragon warning modal navigation", () => {
  test("proceed button navigates to destination", async ({ page }) => {
    await page.goto("/")

    const gridLink = page.locator('a[href="/grid"]')
    const warning = page.getByRole("dialog", { name: "Experimental Territory" })
    const proceedBtn = page.getByRole("button", { name: "Here be dragons..." })

    await gridLink.click()

    await expect(warning).toBeVisible()
    await expect(page).toHaveURL("/")

    await proceedBtn.click()

    await expect(warning).not.toBeVisible()
    await expect(page).toHaveURL(/\/grid$/)
    await expect(page.getByRole("heading", { name: "Experience" })).toBeVisible()
  })
})