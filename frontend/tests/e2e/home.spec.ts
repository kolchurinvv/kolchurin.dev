import { expect, test } from "@playwright/test"

test.describe("home page", () => {
  test("renders landing page, toggles theme, and opens certificate modal", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByRole("heading", { name: "About" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Technical Skills" })).toBeVisible()

    const themeToggle = page.getByRole("button", { name: "Toggle theme" })

    const getMode = () =>
      page.evaluate(() => {
        if (document.body.classList.contains("light")) return "light"
        if (document.body.classList.contains("dark")) return "dark"
        return "none"
      })

    await expect.poll(getMode, { message: "theme should be initialized on body" }).not.toBe("none")

    const initialMode = await getMode()
    await themeToggle.click()

    const expectedMode = initialMode === "dark" ? "light" : "dark"
    await expect.poll(getMode).toBe(expectedMode)
    expect(await page.evaluate(() => localStorage.getItem("mode"))).toBe(expectedMode)

    await page.getByRole("button", { name: /Ekahau ECSE Design/i }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByTitle("Ekahau ECSE Certificate")).toHaveAttribute(
      "src",
      "/2019-ECSE-Certificate-ekahau-Vladimir_Kolchurin.pdf"
    )

    await page.getByRole("dialog").click({ position: { x: 8, y: 8 } })
    await expect(page.getByRole("dialog")).toBeHidden()
  })

  test("shows the raspberry tunnel project with a link to its live dashboard", async ({ page }) => {
    await page.goto("/")

    const card = page.getByRole("article", { name: "Raspberry Tunnel" })
    await expect(card).toBeVisible()

    const liveLink = card.getByRole("link", { name: /rt\.kolchurin\.dev/ })
    await expect(liveLink).toBeVisible()
    await expect(liveLink).toHaveAttribute("href", "https://rt.kolchurin.dev")
    await expect(liveLink).toHaveAttribute("target", "_blank")

    await expect(card.getByRole("link", { name: /source/ })).toHaveAttribute(
      "href",
      "https://github.com/kolchurinvv/raspberry-tunnel"
    )
  })

  test("keeps the raspberry tunnel card inside a 320px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto("/")
    await page.evaluate(() => document.fonts.ready)

    const card = page.getByRole("article", { name: "Raspberry Tunnel" })
    await card.scrollIntoViewIfNeeded()

    const overflowing = await card.evaluate((root) =>
      [root, ...Array.from(root.querySelectorAll("*"))]
        .filter((el) => {
          const r = el.getBoundingClientRect()
          return r.width > 0 && (r.left < -0.5 || r.right > window.innerWidth + 0.5)
        })
        .map((el) => `${el.tagName.toLowerCase()}.${Array.from(el.classList).join(".")}`)
    )
    expect(overflowing).toEqual([])
  })

  test("terminal reads each project's own files from inside its folder", async ({ page }) => {
    await page.goto("/")

    const terminal = page.locator(".terminal")
    const terminalInput = terminal.locator(".hidden-input")
    const run = async (command: string) => {
      await terminalInput.fill(command)
      await terminalInput.press("Enter")
    }

    await run("cd ~/projects/ai-lab")
    await run("cat README.md")
    await expect(terminal.getByText("# AI Infrastructure Lab")).toBeVisible()

    await run("cd ~/projects/dev-sandbox")
    await run("cat README.md")
    await expect(terminal.getByText("# Declarative Development Sandbox")).toBeVisible()
    await run("cat flake.nix")
    await expect(terminal.getByText("pkgs.mkShell")).toBeVisible()

    await expect(terminal.getByText(/No such file/)).toHaveCount(0)
  })

  test("terminal accepts commands", async ({ page }) => {
    await page.goto("/")

    const terminalInput = page.locator(".terminal .hidden-input")
    await terminalInput.fill("help")
    await terminalInput.press("Enter")

    await expect(page.getByText("Available commands:")).toBeVisible()

    await terminalInput.fill("cat skills.json")
    await terminalInput.press("Enter")

    await expect(page.getByRole("heading", { name: "Backend & Databases" })).toBeVisible()
  })
})
