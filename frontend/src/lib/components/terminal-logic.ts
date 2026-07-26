export interface TerminalLine {
  type: "input" | "output" | "error" | "code"
  content: string
}

export interface TerminalCommand {
  name: string
  desc: string
  flags?: string[]
}

export interface RouteInfo {
  path: string
  requiresWarning: boolean
  description: string
}

export interface TerminalData {
  directories: Record<string, string[]>
  virtualFiles: Record<string, string>
  fileContents: Record<string, string>
  routes: RouteInfo[]
}

export interface TerminalState {
  lines: TerminalLine[]
  currentDir: string
}

export interface TerminalExecutionResult {
  lines: TerminalLine[]
  currentDir: string
  effect: TerminalEffect | null
}

export type TerminalEffect =
  | { type: "navigate"; href: string; message: string }
  | { type: "navigateWithWarning"; href: string; message: string; warningLines: TerminalLine[] }
  | { type: "warningConfirm"; route: RouteInfo; warningLines: TerminalLine[] }
  | null

export const DRAGON_ASCII = `
             ++          
              +=++       
       .       +=*+*     
     -++*+++   +++ ++-   
     .+   +-+  +=+ ++ :  
        -+++   +*++++    
       :+*   +.++++++    
       + ++++++++   *    
    *++.++*+-+ +         
   =+   +:++ +*:         
   **   ++ *++++ +       
    ++  = * ++++ +       
        +++++++#         `

export const DRAGON_WARNING_HEADER = ` ===============================================================
                    ! EXPERIMENTAL TERRITORY !
===============================================================`

export const DRAGON_WARNING_MESSAGE = (route: string) =>
  `The route '${route}' is experimental.
Expect bugs, incomplete features, and potential instability.

[1] here be dragons...
[2] stay away`

export const commands: TerminalCommand[] = [
  { name: "whoami", desc: "Display current user" },
  { name: "pwd", desc: "Print working directory" },
  { name: "cd", desc: "Change directory" },
  { name: "ls", desc: "List files" },
  { name: "cat", desc: "Display file contents" },
  {
    name: "contact",
    desc: "Contact me via --email or --phone",
    flags: ["--email", "--phone"],
  },
  { name: "clear", desc: "Clear terminal" },
  { name: "help", desc: "Show this help message" },
]

export function getPrompt(currentDir: string): string {
  return `vladimir@kolchurin:${currentDir.replace("~", "/home/vladimir")}$`
}

export function routeToName(path: string): string {
  if (path === "/") return "~"
  return path.replace(/^\//, "")
}

export function nameToRoute(name: string): string | null {
  if (name === "~" || name === "/") return "/"
  if (name.startsWith("/")) return name
  return `/${name}`
}

export function getSuggestions(
  input: string,
  currentDir: string,
  directories: Record<string, string[]>,
  availableCommands: TerminalCommand[] = commands,
  routes: RouteInfo[] = []
): string[] {
  if (!input) {
    return []
  }

  const partial = input.trim().toLowerCase()
  const parts = partial.split(/\s+/)

  if (parts.length === 1 && input.endsWith(" ")) {
    if (input.toLowerCase().startsWith("cd ")) {
      const routeNames = routes.map((r) => routeToName(r.path))
      return routeNames
    }
    const entries = directories[currentDir] ?? []
    return entries
  }

  if (parts.length === 1) {
    return availableCommands
      .filter((command) => command.name.startsWith(parts[0]))
      .map((command) => command.name)
  }

  if (parts.length === 2 && parts[0] === "contact") {
    const contact = availableCommands.find((command) => command.name === "contact")
    return (contact?.flags ?? []).filter((flag) => flag.startsWith(parts[1]))
  }

  if (parts.length === 2 && (parts[0] === "cat" || parts[0] === "cd")) {
    const entries = directories[currentDir] ?? []
    const routeNames = routes.map((r) => routeToName(r.path))

    let suggestions: string[]
    if (parts[0] === "cd") {
      suggestions = routeNames
    } else {
      suggestions = entries
    }

    const secondArg = parts[1]
    if (!secondArg) {
      return suggestions
    }

    const searchTerm = secondArg.replace(/^\//, "")
    const normalizedSearch = searchTerm === "~" ? "" : searchTerm
    return suggestions.filter((entry) => {
      const entryNorm = entry === "~" ? "" : entry
      return entryNorm.toLowerCase().startsWith(normalizedSearch)
    })
  }

  return []
}

export function cycleSuggestionIndex(
  currentIndex: number,
  length: number,
  direction: "up" | "down"
): number {
  if (length <= 0) {
    return -1
  }

  if (direction === "up") {
    return currentIndex > 0 ? currentIndex - 1 : length - 1
  }

  return currentIndex < length - 1 ? currentIndex + 1 : 0
}

export function applySuggestion(
  currentInput: string,
  suggestions: string[],
  selectedIndex: number
): string {
  if (suggestions.length === 0 || selectedIndex < 0) {
    return currentInput
  }

  const trimmed = currentInput.trim()
  const isCdCommand = trimmed.toLowerCase() === "cd" || trimmed.toLowerCase().startsWith("cd ")

  if (isCdCommand && (trimmed === "cd" || trimmed.endsWith("cd"))) {
    return `cd ${suggestions[selectedIndex]} `
  }

  const parts = trimmed.split(/\s+/)
  parts[parts.length - 1] = suggestions[selectedIndex]

  return `${parts.join(" ")} `
}

export function executeCommand(
  state: TerminalState,
  input: string,
  data: TerminalData
): TerminalExecutionResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return {
      lines: state.lines,
      currentDir: state.currentDir,
      effect: null,
    }
  }

  const lines = [
    ...state.lines,
    {
      type: "input" as const,
      content: `${getPrompt(state.currentDir)} ${trimmed}`,
    },
  ]
  let currentDir = state.currentDir
  let effect: TerminalEffect = null

  const [cmd, ...args] = trimmed.split(/\s+/)

  switch (cmd.toLowerCase()) {
    case "whoami":
      lines.push({ type: "output", content: "vladimir kolchurin" })
      break

    case "pwd":
      lines.push({ type: "output", content: currentDir })
      break

    case "cd": {
      const target = args[0] || "~"
      const routeFromName = nameToRoute(target)
      if (routeFromName) {
        const route = data.routes.find((r) => r.path === routeFromName)
        if (route) {
          if (route.requiresWarning) {
            const warningLines: TerminalLine[] = [
              { type: "output", content: DRAGON_ASCII },
              { type: "output", content: DRAGON_WARNING_HEADER },
              { type: "output", content: "" },
              { type: "output", content: DRAGON_WARNING_MESSAGE(route.path) },
            ]
            lines.push(...warningLines)
            effect = {
              type: "warningConfirm",
              route,
              warningLines,
            }
          } else {
            effect = {
              type: "navigate",
              href: route.path,
              message: `Navigating to ${route.path}...`,
            }
            lines.push({ type: "output", content: effect.message })
          }
          break
        }
      }

      if (target === "~" || target === "~/") {
        effect = {
          type: "navigate",
          href: "/",
          message: "Navigating to /...",
        }
        lines.push({ type: "output", content: effect.message })
      } else if (target === "..") {
        if (currentDir !== "~") {
          const parts = currentDir.split("/")
          parts.pop()
          currentDir = parts.join("/") || "~"
        }
      } else if (target.startsWith("~/")) {
        currentDir = target
      } else {
        const routePath = target.startsWith("/") ? target : `/${target}`
        const route = data.routes.find((r) => r.path === routePath || r.path === `/${target}`)

        if (route) {
          if (route.requiresWarning) {
            const warningLines: TerminalLine[] = [
              { type: "output", content: DRAGON_ASCII },
              { type: "output", content: DRAGON_WARNING_HEADER },
              { type: "output", content: DRAGON_WARNING_MESSAGE(route.path) },
            ]
            lines.push(...warningLines)
            effect = {
              type: "warningConfirm",
              route,
              warningLines,
            }
          } else {
            effect = {
              type: "navigate",
              href: route.path,
              message: `Navigating to ${route.path}...`,
            }
            lines.push({ type: "output", content: effect.message })
          }
          break
        }

        if (target.startsWith("/")) {
          lines.push({ type: "error", content: `cd: no such directory or route: ${target}` })
        } else {
          const newPath = currentDir === "~" ? `~/${target}` : `${currentDir}/${target}`
          if (data.directories[newPath]) {
            currentDir = newPath
          } else {
            lines.push({ type: "error", content: `cd: no such directory or route: ${target}` })
          }
        }
      }
      break
    }

    case "ls":
    case "ll": {
      const files = data.directories[currentDir] ?? []
      const routeNames = currentDir === "~" ? data.routes.map((r) => routeToName(r.path)) : []
      const allItems = [...files, ...routeNames]

      if (args[0] === "-la" || args[0] === "-l" || cmd === "ll") {
        const output = allItems.map((file) => {
          const isDir = data.directories[`${currentDir}/${file}`] !== undefined
          const isRoute = routeNames.includes(file)
          const perms = isRoute ? "lrwxrwxrwx" : isDir ? "drwxr-xr-x" : "-rw-r--r--"
          return `${perms}  1 vladimir staff 4096 Apr 10  ${file}${isDir ? "/" : isRoute ? "@" : ""}`
        })

        lines.push({ type: "code", content: output.join("\n") })
      } else {
        lines.push({ type: "output", content: allItems.join("  ") })
      }
      break
    }

    case "cat": {
      const filename = args[0]
      if (!filename) {
        lines.push({ type: "error", content: "cat: missing file operand" })
      } else if (data.virtualFiles[filename]) {
        lines.push({ type: "code", content: data.virtualFiles[filename] })
      } else if (data.fileContents[`${currentDir}/${filename}`]) {
        lines.push({ type: "code", content: data.fileContents[`${currentDir}/${filename}`] })
      } else {
        lines.push({ type: "error", content: `cat: ${filename}: No such file` })
      }
      break
    }

    case "clear":
      return {
        lines: [],
        currentDir,
        effect: null,
      }

    case "help":
      lines.push({
        type: "output",
        content: `Available commands:
  whoami        - Display current user
  pwd           - Print working directory
  cd <dir>      - Change directory (or navigate to routes like /grid)
  ls            - List files and navigable routes
  cat <file>    - Display file contents
  contact       - Contact me via --email or --phone
  clear         - Clear terminal
  help          - Show this help message

Navigation:
  cd /          - Go to home page
  cd /grid      - Go to grid view (shows dragon warning)
  cd /grid-v2   - Go to grid-v2 view (shows dragon warning)
  cd /bento     - Go to bento view (shows dragon warning)

Try: cat skills.json, cat experience.json, about.txt`,
      })
      break

    case "contact": {
      const flag = args[0]
      if (flag === "--email") {
        effect = {
          type: "navigate",
          href: "mailto:vladimir@kolchurin.dev",
          message: "Opening email client...",
        }
        lines.push({ type: "output", content: effect.message })
      } else if (flag === "--phone") {
        effect = {
          type: "navigate",
          href: "tel:+420605376615",
          message: "Opening phone dialer...",
        }
        lines.push({ type: "output", content: effect.message })
      } else {
        lines.push({
          type: "error",
          content: `contact: invalid flag '${flag}'. Use --email or --phone`,
        })
      }
      break
    }

    default:
      lines.push({
        type: "error",
        content: `${cmd}: command not found. Type 'help' for available commands.`,
      })
  }

  return {
    lines,
    currentDir,
    effect,
  }
}
