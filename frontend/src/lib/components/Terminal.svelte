<script lang="ts">
  import { onMount } from "svelte";

  interface TerminalLine {
    type: "input" | "output" | "error" | "code";
    content: string;
  }

  onMount(() => {
    inputRef?.focus();
  });

  let lines = $state<TerminalLine[]>([
    { type: "output", content: "Welcome to kolchurin.dev terminal" },
    { type: "output", content: "Type 'help' to see available commands" },
    { type: "output", content: "" },
    { type: "input", content: "vladimir@kolchurin:~$ whoami" },
    { type: "output", content: "vladimir kolchurin" },
    { type: "input", content: "vladimir@kolchurin:~$ cat skills.json" },
    {
      type: "code",
      content: `{
  "backend & databases": ["Go", "Node.js/Deno/Bun", "MongoDB/Mongoose", "PostgreSQL"],
  "cloud & devops": ["Kubernetes", "NixOS (Flakes)", "Podman/Docker", "GCP", "AWS Lambda"],
  "networking & systems": ["WireGuard", "Linux SysAdmin", "NGINX", "Traefik", "Cisco Meraki"],
  "ai infrastructure": ["LiteLLM", "Ollama", "Open-WebUI", "Private AI Deployments"]
}`,
    },
  ]);
  let currentInput = $state("");
  let currentDir = $state("~");
  let inputRef: HTMLInputElement;

  const virtualFiles: Record<string, string> = {
    "about.txt": `I specialize in building resilient backend architectures, distributed data
pipelines, and declarative development environments. With a background in
enterprise networking and a DevOps-first mindset, I excel at solving complex
synchronization and infrastructure challenges.`,
    "skills.json": `{
  "backend & databases": ["Go", "Node.js/Deno/Bun", "MongoDB/Mongoose", "PostgreSQL"],
  "cloud & devops": ["Kubernetes", "NixOS (Flakes)", "Podman/Docker", "GCP", "AWS Lambda"],
  "networking & systems": ["WireGuard", "Linux SysAdmin", "NGINX", "Traefik", "Cisco Meraki"],
  "ai infrastructure": ["LiteLLM", "Ollama", "Open-WebUI", "Private AI Deployments"]
}`,
    "experience.json": JSON.stringify(
      [
        {
          company: "Sticky Ventures",
          period: "September 2024 – Present",
          title: "Full-Stack Developer",
          highlights: [
            "Architected licensing & seat-management system",
            "Built resilient local dev environments with Podman-compose",
            "Developed RPE/Wellness reporting engine with MongoDB aggregations",
            "Created data sync pipelines with Go",
          ],
        },
        {
          company: "Cometa Group",
          period: "October 2021 – September 2024",
          title: "Full-Stack Developer",
          highlights: [
            "Massive tech debt reduction: Webpack 3→5, Node 8→16",
            "Architected modular component system",
            "Designed Firebase→Firestore migration path",
            "Built biometric data ingestion pipeline with GCP",
            "Implemented multi-tier subscription engine with Stripe",
          ],
        },
      ],
      null,
      2,
    ),
    "contact.txt": `Email: vladimir@kolchurin.dev
Phone: +420 605 376 615
GitHub: github.com/kolchurinvv`,
    "projects.json": JSON.stringify(
      [
        {
          name: "Hybrid AI & Infrastructure Lab",
          tags: ["Docker Compose", "Traefik", "WireGuard"],
          highlights: [
            "Multi-node AI inference with Docker Compose and Traefik",
            "Secure routing via WireGuard between VPS and private Ollama",
            "Tool-augmented local inference with Open-WebUI",
            "Custom LLM-powered Neovim workflow",
          ],
        },
        {
          name: "Declarative Development Sandbox",
          tags: ["NixOS", "Podman"],
          highlights: [
            "Reproducible dev environment using Nix Flakes",
            "Portable container orchestration with Podman-compose",
          ],
        },
      ],
      null,
      2,
    ),
  };

  const directories: Record<string, string[]> = {
    "~": [
      "skills.json",
      "about.txt",
      "experience.json",
      "contact.txt",
      "projects.json",
    ],
    "~/projects": ["ai-lab", "dev-sandbox"],
    "~/projects/ai-lab": ["README.md", "docker-compose.yml"],
    "~/projects/dev-sandbox": ["README.md", "flake.nix"],
  };

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
  };

  function getPrompt(): string {
    return `vladimir@kolchurin:${currentDir.replace("~", "/home/vladimir")}$`;
  }

  function handleCommand(input: string) {
    const trimmed = input.trim();
    if (!trimmed) return;

    lines.push({ type: "input", content: `${getPrompt()} ${trimmed}` });

    const [cmd, ...args] = trimmed.split(/\s+/);

    switch (cmd.toLowerCase()) {
      case "whoami":
        lines.push({ type: "output", content: "vladimir kolchurin" });
        break;

      case "pwd":
        lines.push({ type: "output", content: currentDir });
        break;

      case "cd": {
        const target = args[0] || "~";
        if (target === "~" || target === "~/") {
          currentDir = "~";
        } else if (target === "..") {
          if (currentDir !== "~") {
            const parts = currentDir.split("/");
            parts.pop();
            currentDir = parts.join("/") || "~";
          }
        } else if (target.startsWith("~/")) {
          currentDir = target;
        } else {
          const newPath =
            currentDir === "~" ? `~/${target}` : `${currentDir}/${target}`;
          if (directories[newPath]) {
            currentDir = newPath;
          } else {
            lines.push({
              type: "error",
              content: `cd: no such directory: ${target}`,
            });
          }
        }
        break;
      }

      case "ls":
      case "ls -la":
      case "ls -l":
      case "ll": {
        const dirKey = currentDir;
        const files = directories[dirKey] || [];
        if (args[0] === "-la" || args[0] === "-l" || cmd === "ll") {
          const output = files.map((f) => {
            const isDir = directories[`${dirKey}/${f}`] !== undefined;
            return `${isDir ? "drwxr-xr-x" : "-rw-r--r--"}  1 vladimir staff 4096 Apr 10  ${f}${isDir ? "/" : ""}`;
          });
          lines.push({ type: "code", content: output.join("\n") });
        } else {
          lines.push({ type: "output", content: files.join("  ") });
        }
        break;
      }

      case "cat": {
        const filename = args[0];
        if (!filename) {
          lines.push({ type: "error", content: "cat: missing file operand" });
        } else if (virtualFiles[filename]) {
          lines.push({ type: "code", content: virtualFiles[filename] });
        } else if (fileContents[currentDir + "/" + filename]) {
          lines.push({
            type: "code",
            content: fileContents[currentDir + "/" + filename],
          });
        } else {
          lines.push({
            type: "error",
            content: `cat: ${filename}: No such file`,
          });
        }
        break;
      }

      case "clear":
        lines.length = 0;
        break;

      case "help":
        lines.push({
          type: "output",
          content: `Available commands:
  whoami        - Display current user
  pwd           - Print working directory
  cd <dir>      - Change directory
  ls            - List files
  cat <file>    - Display file contents
  contact       - Contact me via --email or --phone
  clear         - Clear terminal
  help          - Show this help message

Try: cat skills.json, cat experience.json, about.txt`,
        });
        break;

      case "contact": {
        const flag = args[0];
        if (flag === "--email" || !flag) {
          window.location.href = "mailto:vladimir@kolchurin.dev";
          lines.push({
            type: "output",
            content: "Opening email client...",
          });
        } else if (flag === "--phone") {
          window.location.href = "tel:+420605376615";
          lines.push({
            type: "output",
            content: "Opening phone dialer...",
          });
        } else {
          lines.push({
            type: "error",
            content: `contact: invalid flag '${flag}'. Use --email or --phone`,
          });
        }
        break;
      }

      default:
        lines.push({
          type: "error",
          content: `${cmd}: command not found. Type 'help' for available commands.`,
        });
    }

    currentInput = "";
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      handleCommand(currentInput);
    }
  }

  function focusInput() {
    inputRef?.focus();
  }

  // biome-ignore lint/correctness/noUnusedVariables: is used via use: in the terminal-body
  function scrollToBottom(node: HTMLElement) {
    const observer = new MutationObserver(() => {
      node.scrollTop = node.scrollHeight;
    });
    observer.observe(node, { childList: true });
    return {
      destroy() {
        observer.disconnect();
      },
    };
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
        <span class="input-text">{currentInput}</span><span class="caret"
        ></span>
        <input
          bind:this={inputRef}
          bind:value={currentInput}
          onkeydown={handleKeyDown}
          type="text"
          class="hidden-input"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
        />
      </span>
    </div>
  </div>
</div>

<style>
  .terminal {
    background-color: #0d0d12;
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
    background-color: #0a0a0f;
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
