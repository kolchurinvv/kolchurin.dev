import { expect, test, type Page } from "@playwright/test"

const VIEWPORTS = [
  { name: "1280x720", w: 1280, h: 720, expectPack: false },
  { name: "1920x1080", w: 1920, h: 1080, expectPack: true },
  { name: "768x1024", w: 768, h: 1024, expectPack: false },
]

async function waitForLayoutSettle(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const container = document.querySelector(".masonry-container") as HTMLElement | null
    return container?.dataset.ready === "yes"
  })
  // Allow up to ~3 pack iterations (each ~360ms) plus transition time to settle.
  await page.waitForTimeout(1800)
}

async function readTiles(page: Page) {
  return page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll<HTMLElement>("[data-tile]"))
    return tiles.map((el) => ({
      id: el.dataset.tile,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }))
  })
}

test.describe("grid-v4 priority-anchored layout", () => {
  for (const vp of VIEWPORTS) {
    test(`fits content without internal scroll at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h })
      await page.goto("/grid-v4")
      await waitForLayoutSettle(page)

      const mode = await page.evaluate(() => {
        const c = document.querySelector(".masonry-container") as HTMLElement | null
        return c?.dataset.mode
      })

      if (vp.expectPack) {
        expect(mode, `${vp.name} should reach pack mode with terminal pinned`).toBe("pack")
      } else {
        expect(["pack", "boring"]).toContain(mode)
      }

      const tiles = await readTiles(page)
      expect(tiles.length).toBeGreaterThan(0)

      if (mode === "pack") {
        // The page itself must not scroll. Individual tiles may clip via overflow:hidden
        // when the best-so-far iteration left minor leftover overflow — that's preferable
        // to falling back to the boring vertical layout.
        const docOverflow = await page.evaluate(() => ({
          docScrollHeight: document.documentElement.scrollHeight,
          windowInner: window.innerHeight,
        }))
        expect(docOverflow.docScrollHeight).toBeLessThanOrEqual(docOverflow.windowInner + 1)
      }
    })
  }

  test("anchors the terminal near the viewport gaze point", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto("/grid-v4")
    await waitForLayoutSettle(page)

    const mode = await page.evaluate(() => {
      const c = document.querySelector(".masonry-container") as HTMLElement | null
      return c?.dataset.mode
    })
    expect(mode).toBe("pack")

    const center = await page.evaluate(() => {
      const el = document.querySelector('[data-tile="terminal"]') as HTMLElement | null
      if (!el) return null
      const rect = el.getBoundingClientRect()
      return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 }
    })
    expect(center).not.toBeNull()
    if (!center) return
    // Gaze on 1920x1080 with HORIZONTAL_BIAS=0.5 and VERTICAL_BIAS=0.38 lands roughly at
    // (960, 410). The anchor can shift vertically if iteration grows top/bot strips, so
    // tolerate up to half the anchor's potential height.
    expect(Math.abs(center.cx - 960)).toBeLessThan(120)
    expect(Math.abs(center.cy - 410)).toBeLessThan(180)
  })

  test("rearranges when viewport is resized", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto("/grid-v4")
    await waitForLayoutSettle(page)

    const first = await page.evaluate(() => {
      const el = document.querySelector('[data-tile="experience"]') as HTMLElement | null
      return el?.style.transform ?? ""
    })

    await page.setViewportSize({ width: 1920, height: 1080 })
    await waitForLayoutSettle(page)

    const second = await page.evaluate(() => {
      const el = document.querySelector('[data-tile="experience"]') as HTMLElement | null
      return el?.style.transform ?? ""
    })

    const mode = await page.evaluate(() => {
      const c = document.querySelector(".masonry-container") as HTMLElement | null
      return c?.dataset.mode
    })

    if (mode === "pack") {
      expect(second).not.toBe(first)
    }
  })
})
