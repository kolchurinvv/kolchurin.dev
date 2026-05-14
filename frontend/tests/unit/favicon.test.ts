import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

function dirname(path: string): string {
  return path.split(/[\\/]/).slice(0, -1).join("/") || "."
}
