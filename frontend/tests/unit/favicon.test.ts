import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"

describe("Favicon", () => {
  it("should have a favicon link in app.html", () => {
    const appHtmlPath = join(__dirname, "..", "..", "src", "app.html")
    const appHtml = readFileSync(appHtmlPath, "utf-8")

    // Check for the favicon link
    expect(appHtml).toContain('<link rel="icon" href="/logo.webp" type="image/webp">')
  })

  it("should have the favicon file in static directory", () => {
    const faviconPath = join(__dirname, "..", "..", "static", "logo.webp")
    // This will throw if the file doesn't exist, which will fail the test
    expect(() => readFileSync(faviconPath)).not.toThrow()
  })
})
