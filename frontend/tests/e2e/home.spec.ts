import { expect, test } from "@playwright/test"

test.describe("home page", () => {
  test("renders landing page, toggles theme, and opens certificate modal", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByRole("heading", { name: "About" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Technical Skills" })).toBeVisible()

    const themeToggle = page.getByRole("button", { name: "Toggle theme" })
    await themeToggle.click()

    await expect(page.locator("body")).toHaveClass(/light/)
    expect(await page.evaluate(() => localStorage.getItem("mode"))).toBe("light")

    await page.getByRole("button", { name: /Ekahau ECSE Design/i }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByTitle("Ekahau ECSE Certificate")).toHaveAttribute(
      "src",
      "/2019-ECSE-Certificate-ekahau-Vladimir_Kolchurin.pdf"
    )

    await page.getByRole("dialog").click({ position: { x: 8, y: 8 } })
    await expect(page.getByRole("dialog")).toBeHidden()
  })

  test("terminal accepts commands", async ({ page }) => {
    await page.goto("/")

    const terminalInput = page.locator(".terminal .hidden-input")
    await terminalInput.fill("help")
    await terminalInput.press("Enter")

    await expect(page.getByText("Available commands:")).toBeVisible()

    await terminalInput.fill("cat skills.json")
    await terminalInput.press("Enter")

    await expect(page.getByText("Backend & Databases")).toBeVisible()
  })
})
