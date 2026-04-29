import { vi } from "vitest"

type UiMode = "light" | "dark"

type UiFn = (action: string, value?: string) => string

let uiMode: UiMode = "dark"

const storage = new Map<string, string>()

function createStorageMock(): Storage {
  return {
    get length() {
      return storage.size
    },
    clear() {
      storage.clear()
    },
    getItem(key: string) {
      return storage.get(key) ?? null
    },
    key(index: number) {
      return Array.from(storage.keys())[index] ?? null
    },
    removeItem(key: string) {
      storage.delete(key)
    },
    setItem(key: string, value: string) {
      storage.set(key, value)
    },
  }
}

export class MockIntersectionObserver implements IntersectionObserver {
  static instances: MockIntersectionObserver[] = []

  readonly root = null
  readonly rootMargin = "0px"
  readonly thresholds = [0]

  private readonly callback: IntersectionObserverCallback

  observe = vi.fn<(target: Element) => void>()
  unobserve = vi.fn<(target: Element) => void>()
  disconnect = vi.fn<() => void>()
  takeRecords = vi.fn<() => IntersectionObserverEntry[]>(() => [])

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    MockIntersectionObserver.instances.push(this)
  }

  trigger(target: Element, isIntersecting = true) {
    this.callback(
      [
        {
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRatio: isIntersecting ? 1 : 0,
          intersectionRect: target.getBoundingClientRect(),
          isIntersecting,
          rootBounds: null,
          target,
          time: Date.now(),
        },
      ] as IntersectionObserverEntry[],
      this
    )
  }

  static reset() {
    MockIntersectionObserver.instances = []
  }
}

function createUiMock() {
  return vi.fn<UiFn>((action, value) => {
    if (action !== "mode") {
      return ""
    }

    if (value === "auto") {
      uiMode = "dark"
      return uiMode
    }

    if (value === "light" || value === "dark") {
      uiMode = value
      return uiMode
    }

    return uiMode
  })
}

export function installBrowserMocks() {
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)
  vi.stubGlobal(
    "ResizeObserver",
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: createStorageMock(),
    writable: true,
  })

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: window.localStorage,
    writable: true,
  })

  Object.defineProperty(window, "ui", {
    configurable: true,
    value: createUiMock(),
    writable: true,
  })
}

export function resetBrowserMocks() {
  uiMode = "dark"
  MockIntersectionObserver.reset()
  storage.clear()
  document.body.innerHTML = ""
  document.head.innerHTML = ""

  Object.defineProperty(window, "ui", {
    configurable: true,
    value: createUiMock(),
    writable: true,
  })
}
