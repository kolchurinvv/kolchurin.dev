// @vitest-environment node
import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"
import { resolve } from "path"

describe("Favicon", () => {
  it("should have a favicon link in app.html", () => {
    const appHtmlPath = resolve(__dirname, "..", "..", "src", "app.html")
    const appHtml = readFileSync(appHtmlPath, "utf-8")

    // Check for the favicon link
    expect(appHtml).toContain('<link rel="icon" href="/logo.webp" type="image/webp">')
  })

  it("should have the favicon file in static directory", () => {
    const faviconPath = resolve(__dirname, "..", "..", "static", "logo.webp")
    // Check that the file exists
    expect(() => readFileSync(faviconPath)).not.toThrow()
  })
})
