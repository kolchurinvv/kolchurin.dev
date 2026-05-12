import { describe, expect, it } from "vitest"
import {
  applySuggestion,
  executeCommand,
  getSuggestions,
  type TerminalData,
  type TerminalState,
} from "$lib/components/terminal-logic"

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
}

function makeState(): TerminalState {
  return {
    lines: [],
    currentDir: "~",
  }
}

describe("terminal-logic", () => {
  it("suggests files for cat", () => {
    const suggestions = getSuggestions("cat sk", "~", terminalData.directories)
    expect(suggestions).toEqual(["skills.json"])
  })

  it("applies selected suggestion to input", () => {
    const next = applySuggestion("cat sk", ["skills.json"], 0)
    expect(next).toBe("cat skills.json ")
  })

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
})
