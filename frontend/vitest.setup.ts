import { cleanup } from "@testing-library/svelte"
import "@testing-library/jest-dom/vitest"
import { afterEach, beforeEach } from "vitest"
import { installBrowserMocks, resetBrowserMocks } from "./src/test/browser-mocks"

installBrowserMocks()

beforeEach(() => {
  resetBrowserMocks()
})

afterEach(() => {
  cleanup()
  document.body.className = ""

  document.head.querySelectorAll('link[rel="preload"]').forEach((node) => {
    node.remove()
  })
})
