<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { page } from "$app/state";

  let { children } = $props();

  let themeMode = $state<"light" | "dark">("dark");
  let themeBtn: HTMLButtonElement;

  const getUI = () =>
    (window as unknown as { ui: (action: string, value?: string) => string })
      .ui;

  onMount(() => {
    const ui = getUI();
    const savedMode = localStorage.getItem("mode") as "light" | "dark" | null;
    if (savedMode) {
      themeMode = savedMode;
      ui("mode", savedMode);
      document.body.classList.add(savedMode);
    } else {
      ui("mode", "auto");
      themeMode = (ui("mode") as "light" | "dark") || "dark";
      document.body.classList.add(themeMode);
    }
    updateBtnIcon();
  });

  function toggleTheme() {
    const ui = getUI();
    const newMode = themeMode === "dark" ? "light" : "dark";
    ui("mode", newMode);
    document.body.classList.remove(themeMode);
    document.body.classList.add(newMode);
    localStorage.setItem("mode", newMode);
    themeMode = newMode;
    updateBtnIcon();
  }

  function updateBtnIcon() {
    if (themeBtn) {
      const icon = themeBtn.querySelector("i");
      if (icon)
        icon.textContent = themeMode === "dark" ? "light_mode" : "dark_mode";
    }
  }
</script>

<svelte:head>
  <title>Vladimir Kolchurin</title>
  <meta
    name="description"
    content="Backend & Systems-oriented Engineer specializing in resilient architectures and distributed systems"
  />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <link href="/beercss/beer.min.css" rel="stylesheet" />
  <script type="module" src="/beercss/beer.min.js"></script>
  <script type="module" src="/beercss/material-dynamic-colors.min.js"></script>
</svelte:head>

<nav class="layout-nav">
  <a href="/" class="nav-link" class:active={page.url.pathname === "/"}>
    <i>view_agenda</i>
  </a>
  <a href="/grid" class="nav-link" class:active={page.url.pathname === "/grid"}>
    <i>grid_view</i>
  </a>
  <a
    href="/grid-v2"
    class="nav-link"
    class:active={page.url.pathname === "/grid-v2"}
  >
    <i>apps</i>
  </a>
  <button
    bind:this={themeBtn}
    type="button"
    class="theme-toggle nav-link"
    onclick={toggleTheme}
    aria-label="Toggle theme"
  >
    <i>{themeMode === "dark" ? "light_mode" : "dark_mode"}</i>
  </button>
</nav>

{@render children()}

<style>
  :global(body.light) {
    --bg-primary: #f8f8f8;
    --bg-secondary: #ffffff;
    --bg-tertiary: #f0f0f0;
    --text-primary: #18181b;
    --text-secondary: #52525b;
    --text-muted: #a1a1aa;
    --accent: #0891b2;
    --accent-dim: #22d3ee;
    --border: #d4d4d8;
    --code-bg: #f4f4f5;
  }

  .theme-toggle {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1000;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    color: var(--text-primary);
    cursor: pointer;
    transition:
      border-color 0.2s,
      color 0.2s;
  }

  .theme-toggle:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .layout-nav {
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1000;
    display: flex;
    gap: 0.25rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 0.25rem;
  }

  .nav-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    color: var(--text-secondary);
    border-radius: 8px;
    transition: all 0.2s;
    text-decoration: none;
  }

  .nav-link:hover {
    color: var(--text-primary);
  }

  .nav-link.active {
    background: var(--accent);
    color: var(--bg-primary);
  }

  .nav-link i {
    font-size: 1.25rem;
  }
</style>
