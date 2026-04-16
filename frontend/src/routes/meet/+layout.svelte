<script lang="ts">
  import { authClient } from "$lib/auth/client";
  import { page } from "$app/state";
  import "../../app.css";

  let { data, children } = $props();

  let currentPath = $derived(page.url.pathname);
  let isRoomPage = $derived(currentPath.includes("/meet/") && currentPath.split("/meet/")[1]?.length > 0);

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = "/meet/login";
  }
</script>

<svelte:head>
  <title>Meet | kolchurin.dev</title>
</svelte:head>

{#if !isRoomPage}
  <header class="meet-header">
    <div class="header-content">
      <a href="/meet" class="logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 10l4.553-2.276A2 2 0 0 1 21 6.618V6a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v.618a2 2 0 0 1-1.447 1.902L10 12" />
          <path d="M10 14v-3a2 2 0 0 1 4 0v3" />
          <path d="M10 14a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2" />
        </svg>
        <span>Meet</span>
      </a>
      <div class="user-menu">
        <span class="user-name">{data.user?.name || data.user?.email}</span>
        <button onclick={handleSignOut}>Sign Out</button>
      </div>
    </div>
  </header>
{/if}

<main>
  {@render children()}
</main>

<style>
  .meet-header {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    padding: 1rem 0;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--text-primary);
    font-size: 1.25rem;
    font-weight: 600;
    text-decoration: none;
  }

  .logo svg {
    color: var(--accent);
  }

  .user-menu {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-name {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .user-menu button {
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-secondary);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .user-menu button:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
</style>