import { describe, expect, it } from "vitest"
import {
  applySuggestion,
  executeCommand,
  getSuggestions,
  type TerminalData,
  type TerminalState,
  type RouteInfo,
  DRAGON_ASCII,
  DRAGON_WARNING_HEADER,
  DRAGON_WARNING_MESSAGE,
} from "$lib/components/terminal-logic"

const routes: RouteInfo[] = [
  { path: "/", requiresWarning: false, description: "Home page" },
  { path: "/grid", requiresWarning: true, description: "Grid layout view" },
  { path: "/grid-v2", requiresWarning: true, description: "Masonry layout view" },
  { path: "/grid-v4", requiresWarning: true, description: "Priority-anchored layout" },
]

const terminalData: TerminalData = {
  directories: {
    "~": ["skills.json", "about.txt", "projects"],
    "~/projects": ["README.md"],
  },
  virtualFiles: {
    "skills.json": '{"ok": true}',
    "about.txt": "about",
  },
  fileContents: {
    "~/projects/README.md": "project docs",
  },
  routes,
}

function makeState(): TerminalState {
  return {
    lines: [],
    currentDir: "~",
  }
}

describe("terminal-logic", () => {
  describe("getSuggestions", () => {
    it("suggests files for cat", () => {
      const suggestions = getSuggestions("cat sk", "~", terminalData.directories, undefined, routes)
      expect(suggestions).toEqual(["skills.json"])
    })

    it("suggests only routes for cd", () => {
      const suggestions = getSuggestions("cd sk", "~", terminalData.directories, undefined, routes)
      expect(suggestions).toEqual([])
    })

    it("suggests matching routes for cd", () => {
      const suggestions = getSuggestions("cd g", "~", terminalData.directories, undefined, routes)
      expect(suggestions).toContain("grid")
      expect(suggestions).toContain("grid-v2")
    })

    it("returns empty for unknown command", () => {
      const suggestions = getSuggestions("foo bar", "~", terminalData.directories)
      expect(suggestions).toEqual([])
    })

    it("returns empty for empty input", () => {
      const suggestions = getSuggestions("", "~", terminalData.directories)
      expect(suggestions).toEqual([])
    })

    it("suggests all routes when cd has no argument", () => {
      const suggestions = getSuggestions("cd ", "~", terminalData.directories, undefined, routes)
      expect(suggestions).toEqual(["~", "grid", "grid-v2", "grid-v4"])
    })

    it("filters suggestions case-insensitively for routes", () => {
      const suggestions = getSuggestions("cd GR", "~", terminalData.directories, undefined, routes)
      expect(suggestions).toContain("grid")
      expect(suggestions).toContain("grid-v2")
    })

    it("suggests matching routes for cd", () => {
      const suggestions = getSuggestions("cd g", "~", terminalData.directories, undefined, routes)
      expect(suggestions).toContain("grid")
      expect(suggestions).toContain("grid-v2")
    })

    it("suggests routes when typing partial route path", () => {
      const suggestions = getSuggestions("cd /g", "~", terminalData.directories, undefined, routes)
      expect(suggestions).toContain("grid")
      expect(suggestions).toContain("grid-v2")
    })

    it("returns empty for unknown command", () => {
      const suggestions = getSuggestions("foo bar", "~", terminalData.directories)
      expect(suggestions).toEqual([])
    })

    it("returns empty for empty input", () => {
      const suggestions = getSuggestions("", "~", terminalData.directories)
      expect(suggestions).toEqual([])
    })
  })

  describe("applySuggestion", () => {
    it("applies selected suggestion to input", () => {
      const next = applySuggestion("cat sk", ["skills.json"], 0)
      expect(next).toBe("cat skills.json ")
    })

    it("applies cd suggestion preserving cd prefix", () => {
      const next = applySuggestion("cd", ["~"], 0)
      expect(next).toBe("cd ~ ")
    })

    it("applies cd suggestion for route name", () => {
      const next = applySuggestion("cd", ["grid"], 0)
      expect(next).toBe("cd grid ")
    })

    it("applies cd suggestion with partial input", () => {
      const next = applySuggestion("cd g", ["grid"], 0)
      expect(next).toBe("cd grid ")
    })

    it("returns original input when no suggestions", () => {
      const next = applySuggestion("cat foo", [], 0)
      expect(next).toBe("cat foo")
    })

    it("returns original input when index is negative", () => {
      const next = applySuggestion("cat sk", ["skills.json"], -1)
      expect(next).toBe("cat sk")
    })
  })

  describe("executeCommand", () => {
    it("executes cat on virtual file", () => {
      const result = executeCommand(makeState(), "cat skills.json", terminalData)
      expect(result.lines.at(-1)).toEqual({ type: "code", content: '{"ok": true}' })
      expect(result.effect).toBeNull()
    })

    it("returns navigation effect for contact --email", () => {
      const result = executeCommand(makeState(), "contact --email", terminalData)
      expect(result.effect).toEqual({
        type: "navigate",
        href: "mailto:vladimir@kolchurin.dev",
        message: "Opening email client...",
      })
      expect(result.lines.at(-1)).toEqual({
        type: "output",
        content: "Opening email client...",
      })
    })

    it("returns navigation effect for contact --phone", () => {
      const result = executeCommand(makeState(), "contact --phone", terminalData)
      expect(result.effect).toEqual({
        type: "navigate",
        href: "tel:+420605376615",
        message: "Opening phone dialer...",
      })
    })

    it("shows error for invalid contact flag", () => {
      const result = executeCommand(makeState(), "contact --invalid", terminalData)
      expect(result.lines.at(-1)).toEqual({
        type: "error",
        content: "contact: invalid flag '--invalid'. Use --email or --phone",
      })
    })

    it("executes cd to home directory", () => {
      const result = executeCommand(makeState(), "cd ~", terminalData)
      expect(result.currentDir).toBe("~")
    })

    it("executes cd to projects directory", () => {
      const result = executeCommand(makeState(), "cd projects", terminalData)
      expect(result.currentDir).toBe("~/projects")
    })

    it("executes cd .. to go up a directory", () => {
      const state = { lines: [], currentDir: "~/projects" }
      const result = executeCommand(state, "cd ..", terminalData)
      expect(result.currentDir).toBe("~")
    })

    it("shows error for invalid cd directory", () => {
      const result = executeCommand(makeState(), "cd nonexistent", terminalData)
      expect(result.lines.at(-1)).toEqual({
        type: "error",
        content: "cd: no such directory or route: nonexistent",
      })
    })

    it("executes ls to list files", () => {
      const result = executeCommand(makeState(), "ls", terminalData)
      expect(result.lines.at(-1)?.type).toBe("output")
      expect(result.lines.at(-1)?.content).toContain("skills.json")
      expect(result.lines.at(-1)?.content).toContain("grid")
      expect(result.lines.at(-1)?.content).toContain("grid-v2")
    })

    it("executes ll to list files with details", () => {
      const result = executeCommand(makeState(), "ll", terminalData)
      const outputLine = result.lines.find((l) => l.type === "code")
      expect(outputLine?.content).toContain("skills.json")
      expect(outputLine?.content).toContain("grid@")
    })

    it("executes whoami command", () => {
      const result = executeCommand(makeState(), "whoami", terminalData)
      expect(result.lines.at(-1)).toEqual({ type: "output", content: "vladimir kolchurin" })
    })

    it("executes pwd command", () => {
      const result = executeCommand(makeState(), "pwd", terminalData)
      expect(result.lines.at(-1)).toEqual({ type: "output", content: "~" })
    })

    it("executes clear command", () => {
      const result = executeCommand(makeState(), "clear", terminalData)
      expect(result.lines).toEqual([])
    })

    it("shows error for unknown command", () => {
      const result = executeCommand(makeState(), "unknowncmd", terminalData)
      expect(result.lines.at(-1)).toEqual({
        type: "error",
        content: "unknowncmd: command not found. Type 'help' for available commands.",
      })
    })

    it("handles empty input gracefully", () => {
      const result = executeCommand(makeState(), "", terminalData)
      expect(result.lines).toEqual([])
      expect(result.currentDir).toBe("~")
    })

    it("handles input with extra spaces", () => {
      const result = executeCommand(makeState(), "  cat  skills.json  ", terminalData)
      expect(result.lines.at(-1)).toEqual({ type: "code", content: '{"ok": true}' })
    })
  })

  describe("route navigation", () => {
    it("navigates to root route without warning", () => {
      const result = executeCommand(makeState(), "cd /", terminalData)
      expect(result.effect).toEqual({
        type: "navigate",
        href: "/",
        message: "Navigating to /...",
      })
      expect(result.lines.at(-1)).toEqual({
        type: "output",
        content: "Navigating to /...",
      })
    })

    it("navigates to home via cd ~", () => {
      const result = executeCommand(makeState(), "cd ~", terminalData)
      expect(result.effect).toEqual({
        type: "navigate",
        href: "/",
        message: "Navigating to /...",
      })
    })

    it("shows warning for /grid route", () => {
      const result = executeCommand(makeState(), "cd /grid", terminalData)
      expect(result.effect?.type).toBe("warningConfirm")
      if (result.effect?.type === "warningConfirm") {
        expect(result.effect.route.path).toBe("/grid")
      }

      const warningLine = result.lines.find((l) => l.content.includes("EXPERIMENTAL"))
      expect(warningLine).toBeDefined()
    })

    it("shows warning for /grid-v2 route", () => {
      const result = executeCommand(makeState(), "cd grid-v2", terminalData)
      expect(result.effect?.type).toBe("warningConfirm")
      if (result.effect?.type === "warningConfirm") {
        expect(result.effect.route.path).toBe("/grid-v2")
      }
    })

    it("shows warning for /grid-v4 route", () => {
      const result = executeCommand(makeState(), "cd /grid-v4", terminalData)
      expect(result.effect?.type).toBe("warningConfirm")
      if (result.effect?.type === "warningConfirm") {
        expect(result.effect.route.path).toBe("/grid-v4")
      }
    })

    it("navigates to routes without leading slash", () => {
      const result = executeCommand(makeState(), "cd grid", terminalData)
      expect(result.effect?.type).toBe("warningConfirm")
      if (result.effect?.type === "warningConfirm") {
        expect(result.effect.route.path).toBe("/grid")
      }
    })

    it("shows dragon ASCII art in warning", () => {
      const result = executeCommand(makeState(), "cd /grid", terminalData)
      const asciiLine = result.lines.find((l) => l.content.includes("++"))
      expect(asciiLine).toBeDefined()
    })

    it("does not navigate to non-existent route", () => {
      const result = executeCommand(makeState(), "cd /nonexistent", terminalData)
      expect(result.effect).toBeNull()
      expect(result.lines.at(-1)).toEqual({
        type: "error",
        content: "cd: no such directory or route: /nonexistent",
      })
    })
  })

  describe("constants", () => {
    it("DRAGON_ASCII contains dragon art", () => {
      expect(DRAGON_ASCII).toContain("++")
    })

    it("DRAGON_WARNING_HEADER contains warning text", () => {
      expect(DRAGON_WARNING_HEADER).toContain("EXPERIMENTAL")
    })

    it("DRAGON_WARNING_MESSAGE includes route path", () => {
      const msg = DRAGON_WARNING_MESSAGE("/grid")
      expect(msg).toContain("/grid")
      expect(msg).toContain("experimental")
    })
  })
})
