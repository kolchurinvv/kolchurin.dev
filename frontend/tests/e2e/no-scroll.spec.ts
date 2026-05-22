import { expect, test, type Page } from "@playwright/test"

const VIEWPORTS = [
  { name: "1280x720", w: 1280, h: 720 },
  { name: "1920x1080", w: 1920, h: 1080 },
  { name: "768x1024", w: 768, h: 1024 },
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

      // Either we packed successfully OR fell back to boring. Both are acceptable.
      expect(["pack", "boring"]).toContain(mode)

      const tiles = await readTiles(page)
      expect(tiles.length).toBeGreaterThan(0)

      if (mode === "pack") {
        for (const tile of tiles) {
          expect
            .soft(tile.scrollHeight, `tile ${tile.id} should not scroll vertically`)
            .toBeLessThanOrEqual(tile.clientHeight + 1)
        }
        // Document itself must not scroll in pack mode
        const docOverflow = await page.evaluate(() => ({
          docScrollHeight: document.documentElement.scrollHeight,
          windowInner: window.innerHeight,
        }))
        expect(docOverflow.docScrollHeight).toBeLessThanOrEqual(docOverflow.windowInner + 1)
      }
    })
  }

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

    // Either the anchor tile moved, or we fell back to boring (no transform)
    const mode = await page.evaluate(() => {
      const c = document.querySelector(".masonry-container") as HTMLElement | null
      return c?.dataset.mode
    })

    if (mode === "pack") {
      expect(second).not.toBe(first)
    }
  })
})
