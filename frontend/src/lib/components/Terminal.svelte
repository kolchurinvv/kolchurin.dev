<script lang="ts">
import { onMount } from "svelte"
import { skillsJson, experienceJson, contactText, aboutText, projects } from "$lib/profile"
import {
  applySuggestion,
  cycleSuggestionIndex,
  executeCommand,
  getSuggestions,
  type TerminalLine,
  type RouteInfo,
  type TerminalEffect,
} from "$lib/components/terminal-logic"

let selectedIndex = $state(-1)
let suggestions = $state<string[]>([])

onMount(() => {
  inputRef?.focus()
})

function updateSuggestions(input: string) {
  suggestions = getSuggestions(input, currentDir, directories, undefined, routes)
  selectedIndex = suggestions.length > 0 ? 0 : -1
}

function onInputChange(e: Event) {
  const target = e.target as HTMLInputElement
  currentInput = target.value
  updateSuggestions(currentInput)
}

let lines = $state<TerminalLine[]>([
  { type: "output", content: "Welcome to kolchurin.dev terminal" },
  { type: "output", content: "Type 'help' to see available commands" },
  { type: "output", content: "" },
  { type: "input", content: "vladimir@kolchurin:~$ whoami" },
  { type: "output", content: "vladimir kolchurin" },
  { type: "input", content: "vladimir@kolchurin:~$ cat about.txt" },
  {
    type: "code",
    content: aboutText,
  },
  { type: "output", content: "give this 'terminal' a whilr..." },
])
let currentInput = $state("")
let currentDir = $state("~")
let inputRef: HTMLInputElement
let pendingWarning = $state<RouteInfo | null>(null)

const virtualFiles: Record<string, string> = {
  "about.txt": aboutText,
  "skills.json": skillsJson,
  "experience.json": experienceJson,
  "contact.txt": contactText,
  "projects.json": JSON.stringify(projects, null, 2),
}

const directories: Record<string, string[]> = {
  "~": ["skills.json", "about.txt", "experience.json", "contact.txt", "projects.json"],
  "~/projects": ["ai-lab", "dev-sandbox"],
  "~/projects/ai-lab": ["README.md", "docker-compose.yml"],
  "~/projects/dev-sandbox": ["README.md", "flake.nix"],
}

const fileContents: Record<string, string> = {
  "README.md": `# AI Infrastructure Lab

Multi-node AI inference system with Docker Compose and Traefik.

Run: docker-compose up -d`,
  "flake.nix": `{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  buildInputs = with pkgs; [
    podman
    docker-compose
  ];
}`,
}

const routes: RouteInfo[] = [
  { path: "/", requiresWarning: false, description: "Home page" },
  { path: "/grid", requiresWarning: true, description: "Grid layout view" },
  { path: "/grid-v2", requiresWarning: true, description: "Masonry layout view" },
]

function handleCommand(input: string) {
  if (pendingWarning) {
    const cmd = input.trim()
    if (cmd === "1") {
      window.location.href = pendingWarning.path
      pendingWarning = null
    } else if (cmd === "2") {
      window.location.href = "/"
      pendingWarning = null
    } else {
      lines = [
        ...lines,
        {
          type: "input" as const,
          content: `vladimir@kolchurin:${currentDir}$ ${input}`,
        },
        { type: "error", content: "Invalid choice. Type '1' to proceed or '2' to stay." },
      ]
    }
    currentInput = ""
    return
  }

  const result = executeCommand(
    {
      lines,
      currentDir,
    },
    input,
    {
      directories,
      virtualFiles,
      fileContents,
      routes,
    }
  )

  lines = result.lines
  currentDir = result.currentDir

  if (result.effect?.type === "navigate") {
    window.location.href = result.effect.href
  } else if (result.effect?.type === "warningConfirm") {
    pendingWarning = result.effect.route
  }

  currentInput = ""
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "ArrowUp") {
    e.preventDefault()
    selectedIndex = cycleSuggestionIndex(selectedIndex, suggestions.length, "up")
  } else if (e.key === "ArrowDown") {
    e.preventDefault()
    selectedIndex = cycleSuggestionIndex(selectedIndex, suggestions.length, "down")
  } else if (e.key === "Tab") {
    e.preventDefault()
    currentInput = applySuggestion(currentInput, suggestions, selectedIndex)
    suggestions = []
    selectedIndex = -1
  } else if (e.key === "Enter") {
    suggestions = []
    selectedIndex = -1
    handleCommand(currentInput)
  }
}

function focusInput() {
  inputRef?.focus()
}

// biome-ignore lint/correctness/noUnusedVariables: is used via use: in the terminal-body
function scrollToBottom(node: HTMLElement) {
  const observer = new MutationObserver(() => {
    node.scrollTop = node.scrollHeight
  })
  observer.observe(node, { childList: true })
  return {
    destroy() {
      observer.disconnect()
    },
  }
}
</script>

<div
  class="terminal"
  onclick={focusInput}
  onkeydown={(e) => e.key === "Enter" && focusInput()}
  role="button"
  tabindex="-1"
  onload={focusInput}
>
  <div class="terminal-header">
    <div class="terminal-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <span class="terminal-title">~/kolchurin.dev</span>
  </div>
  <div class="terminal-body" use:scrollToBottom>
    {#each lines as line}
      {#if line.type === "input"}
        <div class="terminal-line">
          <span class="prompt">❯</span>
          <span class="command">{line.content.replace(/^.*\$ /, "")}</span>
        </div>
      {:else if line.type === "code"}
        <div class="terminal-output code-block">
          <pre>{line.content}</pre>
        </div>
      {:else if line.type === "error"}
        <div class="terminal-output error">{line.content}</div>
      {:else}
        <div class="terminal-output">{line.content}</div>
      {/if}
    {/each}
    <div class="terminal-line input-line">
      <span class="prompt">❯</span>
      <span class="input-wrapper">
        <span class="input-text">{currentInput}</span><span class="caret"></span>
        <input
          bind:this={inputRef}
          bind:value={currentInput}
          onkeydown={handleKeyDown}
          oninput={onInputChange}
          type="text"
          class="hidden-input"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
        >
      </span>
    </div>
    {#if suggestions.length > 0}
      <div class="suggestions">
        {#each suggestions as suggestion, i}
          <span class:suggestion-item={true} class:selected={i === selectedIndex}
            >{suggestion}</span
          >
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
.terminal {
  background-color: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  cursor: text;
}

.terminal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background-color: var(--bg-tertiary);
  border-bottom: 1px solid var(--border);
}

.terminal-dots {
  display: flex;
  gap: 0.5rem;
}

.terminal-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.terminal-dots span:nth-child(1) {
  background-color: #ef4444;
}
.terminal-dots span:nth-child(2) {
  background-color: #eab308;
}
.terminal-dots span:nth-child(3) {
  background-color: #22c55e;
}

.terminal-title {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-family: monospace;
}

.terminal-body {
  padding: 1.25rem 1.5rem;
  font-family: monospace;
  font-size: 0.9rem;
  height: 520px;
  overflow-x: auto;
  overflow-y: auto;
}

.terminal-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.terminal-line.input-line {
  margin-bottom: 0;
}

.prompt {
  color: var(--accent);
  flex-shrink: 0;
}

.command {
  color: var(--text-primary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
}

.input-text {
  color: var(--text-primary);
  white-space: pre;
}

.caret {
  display: inline-block;
  width: 0.6em;
  height: 1.1em;
  background-color: var(--accent);
  animation: blink 1s step-end infinite;
  vertical-align: text-bottom;
  flex-shrink: 0;
  border-radius: 0;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.hidden-input {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: inherit;
  color: transparent;
  caret-color: transparent;
}

.terminal-output {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  padding-left: 1.25rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.terminal-output.error {
  color: #ef4444;
}

.code-block {
  overflow-x: auto;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.code-block pre {
  margin: 0;
  white-space: pre;
  background-color: unset;
}

.suggestions {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0;
  font-family: "Space Mono", monospace;
  font-size: 0.85rem;
  color: var(--text-muted);
  flex-wrap: wrap;
}

.suggestion-item {
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  background-color: var(--bg-tertiary);
}

.suggestion-item.selected {
  background-color: var(--accent);
  color: var(--bg-primary);
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #0d0d12;
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}
</style>
