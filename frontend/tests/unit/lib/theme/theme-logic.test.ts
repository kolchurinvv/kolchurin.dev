import { describe, expect, it, vi } from "vitest"
import { initializeTheme, nextThemeMode, toggleTheme } from "$lib/theme/theme-logic"

describe("theme-logic", () => {
  it("nextThemeMode toggles light/dark", () => {
    expect(nextThemeMode("dark")).toBe("light")
    expect(nextThemeMode("light")).toBe("dark")
  })

  it("initializeTheme uses saved mode when present", () => {
    const ui = vi.fn(() => "dark")
    const body = document.createElement("body")
    const storage = {
      getItem: vi.fn(() => "light"),
      setItem: vi.fn(),
    }

    const mode = initializeTheme({
      ui,
      storage,
      bodyClassList: body.classList,
    })

    expect(mode).toBe("light")
    expect(body.classList.contains("light")).toBe(true)
    expect(ui).toHaveBeenCalledWith("mode", "light")
  })

  it("toggleTheme updates ui, storage and body class", () => {
    const ui = vi.fn(() => "light")
    const body = document.createElement("body")
    body.classList.add("dark")

    const storage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    }

    const mode = toggleTheme(
      {
        ui,
        storage,
        bodyClassList: body.classList,
      },
      "dark"
    )

    expect(mode).toBe("light")
    expect(ui).toHaveBeenCalledWith("mode", "light")
    expect(storage.setItem).toHaveBeenCalledWith("mode", "light")
    expect(body.classList.contains("light")).toBe(true)
    expect(body.classList.contains("dark")).toBe(false)
  })
})
