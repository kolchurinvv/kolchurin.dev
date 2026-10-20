import { expect, test } from "@playwright/test"

const PHONES = [
  { name: "iPhone 11", width: 414, height: 896 },
  { name: "iPhone SE", width: 375, height: 667 },
  { name: "narrow phone", width: 320, height: 568 },
]

interface Box {
  left: number
  right: number
  top: number
  bottom: number
}

const overlaps = (a: Box, b: Box) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom

test.describe("home page header on phones", () => {
  for (const phone of PHONES) {
    test(`fits a ${phone.width}px viewport (${phone.name})`, async ({ page }) => {
      await page.setViewportSize({ width: phone.width, height: phone.height })
      await page.goto("/")
      await page.evaluate(() => document.fonts.ready)

      // The terminal focuses its input on mount, which may scroll the page, so
      // boxes are taken in document coordinates; the fixed nav sits at scrollY 0.
      const layout = await page.evaluate(() => {
        const box = (el: Element) => {
          const r = el.getBoundingClientRect()
          return {
            left: r.left,
            right: r.right,
            top: r.top + window.scrollY,
            bottom: r.bottom + window.scrollY,
          }
        }
        const viewportBox = (el: Element) => {
          const r = el.getBoundingClientRect()
          return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }
        }
        const header = document.querySelector(".header") as HTMLElement
        const overflowing = Array.from(header.querySelectorAll("*"))
          .filter((el) => {
            const r = el.getBoundingClientRect()
            return r.width > 0 && (r.left < -0.5 || r.right > window.innerWidth + 0.5)
          })
          .map((el) => `${el.tagName.toLowerCase()}.${Array.from(el.classList).join(".")}`)

        return {
          viewportWidth: document.documentElement.clientWidth,
          headerScrollWidth: header.scrollWidth,
          headerClientWidth: header.clientWidth,
          overflowing,
          avatar: box(document.querySelector(".avatar") as Element),
          nav: viewportBox(document.querySelector(".layout-nav") as Element),
          toggle: viewportBox(document.querySelector(".theme-toggle") as Element),
        }
      })

      expect(layout.overflowing).toEqual([])
      expect(layout.headerScrollWidth).toBeLessThanOrEqual(layout.headerClientWidth)

      const avatarCenter = (layout.avatar.left + layout.avatar.right) / 2
      expect(Math.abs(avatarCenter - layout.viewportWidth / 2)).toBeLessThanOrEqual(1)

      expect(overlaps(layout.nav, layout.avatar)).toBe(false)
      expect(overlaps(layout.toggle, layout.avatar)).toBe(false)
    })
  }
})
