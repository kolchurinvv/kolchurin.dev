<script lang="ts">
  function generateRoomId(): string {
    return crypto.randomUUID();
  }

  function createMeeting() {
    const roomId = generateRoomId();
    window.location.href = `/meet/${roomId}`;
  }

  async function copyInviteLink(roomId: string) {
    const link = `${window.location.origin}/meet/${roomId}`;
    await navigator.clipboard.writeText(link);
    alert("Invite link copied to clipboard!");
  }
</script>

<svelte:head>
  <title>Meet | kolchurin.dev</title>
</svelte:head>

<div class="meet-dashboard">
  <div class="welcome-section">
    <h1>Video Meetings</h1>
    <p>Create private meetings and invite anyone to join via a unique link.</p>
  </div>

  <div class="actions-grid">
    <button class="action-card create" onclick={createMeeting}>
      <div class="action-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 10l4.553-2.276A2 2 0 0 1 21 6.618V6a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v.618a2 2 0 0 1-1.447 1.902L10 12" />
          <path d="M10 14v-3a2 2 0 0 1 4 0v3" />
          <path d="M10 14a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      </div>
      <h3>New Meeting</h3>
      <p>Start a new video call</p>
    </button>
  </div>

  <div class="info-section">
    <h2>How it works</h2>
    <ol>
      <li>Click "New Meeting" to create a room</li>
      <li>Copy the invite link</li>
      <li>Share it with anyone you want to chat with</li>
      <li>They can join directly via the link - no account needed</li>
    </ol>
    <div class="note">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <span>Note: Meetings are end-to-end encrypted. Your privacy is protected.</span>
    </div>
  </div>
</div>

<style>
  .meet-dashboard {
    max-width: 600px;
    margin: 0 auto;
  }

  .welcome-section {
    margin-bottom: 3rem;
  }

  .welcome-section h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  .welcome-section p {
    color: var(--text-muted);
    font-size: 1.1rem;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .action-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2.5rem 2rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .action-card:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
  }

  .action-card.create .action-icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--accent), var(--accent-dim));
    border-radius: 16px;
    color: var(--bg-primary);
    margin-bottom: 1.5rem;
  }

  .action-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  .action-card p {
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .info-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .info-section h2 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
  }

  .info-section ol {
    margin: 0;
    padding-left: 1.5rem;
    color: var(--text-secondary);
    line-height: 2;
  }

  .note {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1.5rem;
    padding: 1rem;
    background: rgba(34, 211, 238, 0.1);
    border-radius: 8px;
    color: var(--accent);
    font-size: 0.85rem;
  }

  .note svg {
    flex-shrink: 0;
  }
</style>