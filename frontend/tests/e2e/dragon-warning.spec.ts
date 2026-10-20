import { expect, test } from "@playwright/test"

test.describe("dragon warning modal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("shows warning when navigating to /grid", async ({ page }) => {
    const warning = page.getByRole("dialog", { name: "Experimental Territory" })

    await page.locator('a[href="/grid"]').click()

    await expect(warning).toBeVisible()
    await expect(page.getByRole("heading", { name: "Experimental Territory" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Stay safe" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Here be dragons..." })).toBeVisible()
  })

  test("shows warning when navigating to /grid-v2", async ({ page }) => {
    const warning = page.getByRole("dialog", { name: "Experimental Territory" })

    await page.locator('a[href="/grid-v2"]').click()

    await expect(warning).toBeVisible()
    await expect(page.getByRole("heading", { name: "Experimental Territory" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Stay safe" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Here be dragons..." })).toBeVisible()
  })

  test("shows warning when navigating to /bento", async ({ page }) => {
    const warning = page.getByRole("dialog", { name: "Experimental Territory" })

    await page.locator('a[href="/bento"]').click()

    await expect(warning).toBeVisible()
    await expect(page.getByRole("heading", { name: "Experimental Territory" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Stay safe" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Here be dragons..." })).toBeVisible()
  })

  test("proceeding from the /bento warning opens the bento layout", async ({ page }) => {
    await page.locator('a[href="/bento"]').click()

    const warning = page.getByRole("dialog", { name: "Experimental Territory" })
    await expect(warning).toBeVisible()

    await page.getByRole("button", { name: "Here be dragons..." }).click()
    await expect(warning).not.toBeVisible()
    await expect(page).toHaveURL(/\/bento$/)
  })

  test("dismissing modal navigates back to home", async ({ page }) => {
    await page.locator('a[href="/grid"]').click()

    const warning = page.getByRole("dialog", { name: "Experimental Territory" })
    await expect(warning).toBeVisible()

    await page.getByRole("button", { name: "Stay safe" }).click()
    await expect(warning).not.toBeVisible()
    await expect(page).toHaveURL("/")
  })

  test("proceeding navigates to experimental route", async ({ page }) => {
    await page.locator('a[href="/grid"]').click()

    const warning = page.getByRole("dialog", { name: "Experimental Territory" })
    await expect(warning).toBeVisible()

    await page.getByRole("button", { name: "Here be dragons..." }).click()
    await expect(warning).not.toBeVisible()
    await expect(page).toHaveURL(/\/grid$/)
  })

  test("warning shows every time, no session persistence", async ({ page }) => {
    const warning = page.getByRole("dialog", { name: "Experimental Territory" })

    await page.locator('a[href="/grid"]').click()
    await expect(warning).toBeVisible()
    await page.getByRole("button", { name: "Here be dragons..." }).click()
    await expect(warning).not.toBeVisible()
    await expect(page).toHaveURL(/\/grid$/)

    await page.locator('a[href="/"]').click()
    await expect(page).toHaveURL("/")

    await page.locator('a[href="/grid"]').click()
    await expect(warning).toBeVisible()

    await page.getByRole("button", { name: "Here be dragons..." }).click()
    await expect(warning).not.toBeVisible()
    await expect(page).toHaveURL(/\/grid$/)

    await page.locator('a[href="/"]').click()
    await expect(page).toHaveURL("/")

    await page.locator('a[href="/grid-v2"]').click()
    await expect(warning).toBeVisible()
  })

  test("can dismiss from grid and then proceed", async ({ page }) => {
    await page.locator('a[href="/grid"]').click()

    const warning = page.getByRole("dialog", { name: "Experimental Territory" })
    await expect(warning).toBeVisible()

    await page.getByRole("button", { name: "Stay safe" }).click()
    await expect(warning).not.toBeVisible()
    await expect(page).toHaveURL("/")

    await page.locator('a[href="/grid"]').click()
    await expect(warning).toBeVisible()
    await page.getByRole("button", { name: "Here be dragons..." }).click()
    await expect(page).toHaveURL(/\/grid$/)
  })
})
