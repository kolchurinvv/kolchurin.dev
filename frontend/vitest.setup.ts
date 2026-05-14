import { cleanup } from "@testing-library/svelte"
import { afterEach, beforeEach } from "vitest"

if (typeof window !== "undefined") {
  // browser setup
  import("@testing-library/jest-dom/vitest")
  import("./src/test/browser-mocks").then(({ installBrowserMocks, resetBrowserMocks }) => {
    installBrowserMocks()
    beforeEach(() => resetBrowserMocks())
    afterEach(() => {
      resetBrowserMocks()
      cleanup()
      document.body.className = ""
      document.head.querySelectorAll('link[rel="preload"]').forEach((node) => {
        node.remove()
      })
    })
  })
} else {
  // node setup
  afterEach(() => cleanup())
}
