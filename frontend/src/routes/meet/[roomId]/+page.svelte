<script lang="ts">
  import { page } from "$app/state";

  interface PageData {
    user?: {
      id: string;
      name: string | null;
      email: string;
      emailVerified: boolean;
    } | null;
  }

  let { data }: { data: PageData } = $props();
  let roomId = $derived(page.params.roomId);

  let meetUrl = "https://kolchurin.dev/meet/miro";
  let iframeSrc = $derived(`${meetUrl}?room=${roomId}&name=${encodeURIComponent(data.user?.name || data.user?.email || "Guest")}`);

  async function copyInviteLink() {
    const link = `${window.location.origin}/meet/${roomId}`;
    await navigator.clipboard.writeText(link);
    alert("Invite link copied to clipboard!");
  }
</script>

<svelte:head>
  <title>Meeting {roomId} | kolchurin.dev/meet</title>
</svelte:head>

<div class="meeting-room">
  <div class="meeting-header">
    <div class="header-left">
      <a href="/meet" class="back-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Leave Meeting
      </a>
      <span class="room-id">Room: {roomId}</span>
    </div>
    <div class="header-right">
      <button class="invite-btn" onclick={copyInviteLink}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        Copy Invite Link
      </button>
    </div>
  </div>

  <div class="iframe-container">
    <iframe
      src={iframeSrc}
      title="Video Meeting"
      allow="camera; microphone; display-capture; fullscreen; geolocation; picture-in-picture"
      allowfullscreen
    ></iframe>
  </div>
</div>

<style>
  .meeting-room {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 64px);
    margin: -2rem;
    padding: 0;
  }

  .meeting-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .back-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted);
    font-size: 0.9rem;
    text-decoration: none;
    transition: color 0.2s;
  }

  .back-link:hover {
    color: #ef4444;
  }

  .room-id {
    font-family: monospace;
    font-size: 0.85rem;
    color: var(--text-muted);
    background: var(--bg-primary);
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
  }

  .header-right {
    display: flex;
    gap: 1rem;
  }

  .invite-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--accent);
    border: none;
    border-radius: 6px;
    color: var(--bg-primary);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .invite-btn:hover {
    opacity: 0.9;
  }

  .iframe-container {
    flex: 1;
    background: #1a1a1a;
  }

  .iframe-container iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: #1a1a1a;
  }
</style>