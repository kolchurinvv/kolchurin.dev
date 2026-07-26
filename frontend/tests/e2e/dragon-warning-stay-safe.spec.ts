import { expect, test } from "@playwright/test"

test.describe("dragon warning modal stay safe button", () => {
  test("stay safe always navigates to home from /", async ({ page }) => {
    await page.goto("/")

    const warning = page.getByRole("dialog", { name: "Experimental Territory" })
    const staySafeBtn = page.getByRole("button", { name: "Stay safe" })

    await page.locator('a[href="/grid"]').click()
    await expect(warning).toBeVisible()

    await staySafeBtn.click()
    await expect(warning).not.toBeVisible()
    await expect(page).toHaveURL("/")
  })

  test("stay safe always navigates to home from /grid", async ({ page }) => {
    await page.goto("/grid")

    const warning = page.getByRole("dialog", { name: "Experimental Territory" })
    const staySafeBtn = page.getByRole("button", { name: "Stay safe" })

    await page.locator('a[href="/grid-v2"]').click()
    await expect(warning).toBeVisible()

    await staySafeBtn.click()
    await expect(warning).not.toBeVisible()
    await expect(page).toHaveURL("/")
  })

  test("stay safe always navigates to home from /grid-v2", async ({ page }) => {
    await page.goto("/grid-v2")

    const warning = page.getByRole("dialog", { name: "Experimental Territory" })
    const staySafeBtn = page.getByRole("button", { name: "Stay safe" })

    await page.locator('a[href="/grid"]').click()
    await expect(warning).toBeVisible()

    await staySafeBtn.click()
    await expect(warning).not.toBeVisible()
    await expect(page).toHaveURL("/")
  })

  test("stay safe always navigates to home from /bento", async ({ page }) => {
    await page.goto("/bento")

    const warning = page.getByRole("dialog", { name: "Experimental Territory" })
    const staySafeBtn = page.getByRole("button", { name: "Stay safe" })

    await page.locator('a[href="/grid"]').click()
    await expect(warning).toBeVisible()

    await staySafeBtn.click()
    await expect(warning).not.toBeVisible()
    await expect(page).toHaveURL("/")
  })

  test("stay safe dismisses the /bento warning", async ({ page }) => {
    await page.goto("/")

    const warning = page.getByRole("dialog", { name: "Experimental Territory" })
    const staySafeBtn = page.getByRole("button", { name: "Stay safe" })

    await page.locator('a[href="/bento"]').click()
    await expect(warning).toBeVisible()

    await staySafeBtn.click()
    await expect(warning).not.toBeVisible()
    await expect(page).toHaveURL("/")
  })
})
