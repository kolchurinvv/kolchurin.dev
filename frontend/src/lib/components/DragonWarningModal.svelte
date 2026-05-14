<script lang="ts">
interface Props {
  destination: string
  onDismiss: () => void
  onProceed: () => void
}

let { destination, onDismiss, onProceed }: Props = $props()

function proceed() {
  onProceed()
}

function dismiss() {
  onDismiss()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    dismiss()
  }
}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="dragon-overlay" role="dialog" aria-modal="true" aria-labelledby="dragon-title">
  <div class="dragon-modal">
    <img src="/dragon-warning.png" alt="Dragon" class="dragon-image" />
    <h2 id="dragon-title" class="dragon-title">Experimental Territory</h2>
    <p class="dragon-message">
      The route <code>{destination}</code> is experimental. Expect bugs, incomplete features, and
      potential instability.
    </p>
    <div class="dragon-actions">
      <button type="button" class="btn btn-safe" onclick={dismiss}>Stay safe</button>
      <button type="button" class="btn btn-dragon" onclick={proceed}>Here be dragons...</button>
    </div>
  </div>
</div>

<style>
.dragon-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.dragon-modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2rem;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow:
    0 0 60px rgba(139, 92, 246, 0.15),
    0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.dragon-image {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  border-radius: 50%;
}

.dragon-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  font-family: "Space Mono", monospace;
}

.dragon-message {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.dragon-message code {
  background: var(--bg-tertiary);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: "Space Mono", monospace;
  color: var(--accent);
}

.dragon-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-safe {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-primary);
}

.btn-safe:hover {
  border-color: #22c55e;
  color: #22c55e;
}

.btn-dragon {
  background: var(--accent);
  color: var(--bg-primary);
  border: none;
}

.btn-dragon:hover {
  background: var(--accent-dim);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(8, 145, 178, 0.3);
}
</style>
