import { describe, expect, it } from "vitest"
import {
  EKAHUA_ECSE_CERTIFICATE_PATH,
  setupCertificatePreloadOnIntersect,
} from "$lib/routes/certificates"
import { MockIntersectionObserver } from "$test/browser-mocks"

describe("certificates", () => {
  it("preloads certificate once section intersects", () => {
    const section = document.createElement("section")

    const cleanup = setupCertificatePreloadOnIntersect(section, document)

    const observer = MockIntersectionObserver.instances.at(-1)
    expect(observer).toBeDefined()

    observer?.trigger(section, true)

     const preload = document.head.querySelector(
       `link[rel="preload"][href="${EKAHUA_ECSE_CERTIFICATE_PATH}"]`
     )
    expect(preload).not.toBeNull()

    cleanup()
  })

  it("returns noop cleanup when section is missing", () => {
    const cleanup = setupCertificatePreloadOnIntersect(null, document)

    expect(typeof cleanup).toBe("function")
    cleanup()
  })
})
