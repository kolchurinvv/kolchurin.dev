<script lang="ts">
import { onMount } from "svelte"
import BentoLayout from "$lib/components/BentoLayout.svelte"
import BentoTile from "$lib/components/BentoTile.svelte"
import Terminal from "$lib/components/Terminal.svelte"
import { BENTO_ADJACENCY, BENTO_TILES } from "$lib/bento/inventory"
import type { TileMeta } from "$lib/bento/types"
import { contact, skills, experience, currentlyBuilding, statusBadge } from "$lib/profile"
import {
  EKAHUA_ECSE_CERTIFICATE_PATH,
  setupCertificatePreloadOnIntersect,
} from "$lib/routes/certificates"

const skillCategoryIdMap: Record<string, string> = {
  "Backend & Databases": "skills-backend",
  "Cloud & DevOps": "skills-cloud",
  "Networking & Systems": "skills-networking",
  "AI Infrastructure": "skills-ai",
}

// Per-category material icon, matching the homepage's Technical Skills cards.
const skillIcons = ["dns", "cloud", "router", "psychology"]

// Single source of truth for per-tile packing metadata. The page must pass the
// inventory's aspect bands through to <BentoTile> — otherwise the packer runs
// with no shape guidance and tiles deform freely.
const meta: Record<string, TileMeta> = Object.fromEntries(
  BENTO_TILES.map((t) => [t.id, t])
)

let showPdf = $state(false)
let certSection = $state<HTMLElement | undefined>()

onMount(() => setupCertificatePreloadOnIntersect(certSection, document))

function openPdf() {
  showPdf = true
}
function closePdf() {
  showPdf = false
}
</script>

<svelte:head>
  <title>bento — packed layout</title>
</svelte:head>

<nav class="skip-links" aria-label="Skip to section">
  <a href="#terminal">Skip to terminal</a>
  <a href="#experience">Skip to experience</a>
  <a href="#projects-currently-building">Skip to current work</a>
</nav>

<BentoLayout adjacency={BENTO_ADJACENCY} gutter={12}>
  <!-- ── Header ─────────────────────────────────────────────────────────── -->
  <BentoTile id="header" priority="secondary" minWidth={320} minHeight={180} aspectRatio={meta["header"].aspectRatio} ariaLabelledby="header-h">
    <div class="card header-card">
      <figure class="avatar"><img src="/headshot.webp" alt="Vladimir Kolchurin" /></figure>
      <div class="header-text">
        <h1 id="header-h" class="name">Vladimir Kolchurin</h1>
        <p class="tagline">Backend &amp; Systems Engineer</p>
        <div class="contact">
          <a href={`mailto:${contact.email}`} class="command-line">
            <span class="prompt">❯</span>
            <span class="cmd">contact</span>
            <span class="arg">--email</span>
            <span class="value">{contact.email}</span>
          </a>
          <div class="contact-secondary">
            <a href={`https://${contact.github}`} target="_blank" rel="noopener" class="secondary-link">
              <i class="tiny">code</i>
              {contact.github}
            </a>
            <a href={`https://${contact.linkedin}`} target="_blank" rel="noopener" class="secondary-link">
              <i class="tiny">link</i>
              linkedin
            </a>
            <a href={`tel:${contact.phone.replace(/\s/g, "")}`} class="secondary-link">
              <i class="tiny">phone</i>
              {contact.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  </BentoTile>

  <!-- ── Status badge (broken out of header) ────────────────────────────── -->
  <BentoTile
    id="status-badge"
    priority="quaternary"
    placement="feature"
    minWidth={160}
    minHeight={36}
    aspectRatio={meta["status-badge"].aspectRatio}
    ariaLabelledby="status-h"
  >
    <div class="card status-card">
      <span class="prompt">❯</span>
      <span id="status-h" class="status-text">{statusBadge.label}</span>
      <span class="cursor-blink" aria-hidden="true">▌</span>
    </div>
  </BentoTile>

  <!-- ── About ──────────────────────────────────────────────────────────── -->
  <BentoTile id="about" priority="tertiary" minWidth={260} minHeight={180} aspectRatio={meta["about"].aspectRatio} ariaLabelledby="about-h">
    <div class="card about-card">
      <div class="tile-head">
        <span class="tile-icon"><i class="small">person</i></span>
        <h2 id="about-h">About</h2>
      </div>
      <p class="about-text">
        I specialize in building <span class="highlight">resilient backend architectures</span>,
        distributed data pipelines, and declarative development environments. With a background in
        enterprise networking and a <span class="highlight">DevOps-first</span> mindset, I excel at
        solving complex synchronization and infrastructure challenges—moving beyond the UI to
        engineer robust, high-performance systems.
      </p>
      <div class="stats">
        <div class="stat"><span class="stat-value">7+</span><span class="stat-label">Years Experience</span></div>
        <div class="stat"><span class="stat-value">5</span><span class="stat-label">Companies Served</span></div>
        <div class="stat"><span class="stat-value">2</span><span class="stat-label">Certifications</span></div>
      </div>
    </div>
  </BentoTile>

  <!-- ── Terminal (primary) ─────────────────────────────────────────────── -->
  <BentoTile id="terminal" priority="primary" minWidth={560} minHeight={360} aspectRatio={meta["terminal"].aspectRatio} ariaLabelledby="terminal-h">
    <div class="card terminal-card">
      <h2 id="terminal-h" class="sr-only">Terminal</h2>
      <Terminal />
    </div>
  </BentoTile>

  <!-- ── Experience (full timeline + highlights) ────────────────────────── -->
  <BentoTile id="experience" priority="secondary" minWidth={280} minHeight={360} aspectRatio={meta["experience"].aspectRatio} ariaLabelledby="exp-h">
    <div class="card experience-card">
      <div class="tile-head">
        <span class="tile-icon"><i class="small">work</i></span>
        <h2 id="exp-h">Experience</h2>
      </div>
      <div class="timeline">
        {#each experience as job, i (job.company)}
          <div class="timeline-item">
            <div class="timeline-marker">
              <div class="marker-dot"></div>
              {#if i < experience.length - 1}<div class="marker-line"></div>{/if}
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-company">{job.company}</span>
                <span class="timeline-period">{job.period}</span>
              </div>
              <div class="timeline-title">{job.title}</div>
              <ul>
                {#each job.highlights as highlight (highlight)}
                  <li>{highlight}</li>
                {/each}
              </ul>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </BentoTile>

  <!-- ── Currently Building (bento-original, projects cluster) ──────────── -->
  <BentoTile
    id="projects-currently-building"
    priority="tertiary"
    cluster="projects"
    clusterOrder={1}
    minWidth={240}
    minHeight={200}
    aspectRatio={meta["projects-currently-building"].aspectRatio}
    ariaLabelledby="cb-h"
  >
    <div class="card project-card current-card">
      <div class="chip building">Building</div>
      <h3 id="cb-h">Currently Building</h3>
      <pre class="current-body">{currentlyBuilding}</pre>
      <small class="terminal-hint">also: <code>cat current.md</code> in the terminal</small>
    </div>
  </BentoTile>

  <!-- ── Project: Hybrid AI & Infrastructure Lab ────────────────────────── -->
  <BentoTile
    id="projects-ai-lab"
    priority="tertiary"
    cluster="projects"
    clusterOrder={2}
    minWidth={240}
    minHeight={200}
    aspectRatio={meta["projects-ai-lab"].aspectRatio}
    ariaLabelledby="proj-ai-h"
  >
    <article class="card project-card">
      <div class="chip">AI</div>
      <h3 id="proj-ai-h">Hybrid AI &amp; Infrastructure Lab</h3>
      <p class="project-stack">
        <i class="tiny">cloud</i> Docker Compose <span class="separator">•</span>
        <i class="tiny">language</i> Traefik <span class="separator">•</span>
        <i class="tiny">vpn</i> WireGuard
      </p>
      <ul class="project-highlights">
        <li>Multi-node AI inference system with Docker Compose and Traefik reverse proxy</li>
        <li>Secure routing between public VPS services and private Ollama via WireGuard</li>
        <li>Tool-augmented local inference with Open-WebUI + external search APIs</li>
        <li>Custom LLM-powered Neovim workflow (CopilotChat + LiteLLM)</li>
      </ul>
    </article>
  </BentoTile>

  <!-- ── Project: Declarative Development Sandbox ───────────────────────── -->
  <BentoTile
    id="projects-dev-sandbox"
    priority="tertiary"
    cluster="projects"
    clusterOrder={3}
    minWidth={240}
    minHeight={200}
    aspectRatio={meta["projects-dev-sandbox"].aspectRatio}
    ariaLabelledby="proj-dev-h"
  >
    <article class="card project-card">
      <div class="chip dev">Dev</div>
      <h3 id="proj-dev-h">Declarative Development Sandbox</h3>
      <p class="project-stack">
        <i class="tiny">code</i> NixOS <span class="separator">•</span>
        <i class="tiny">inventory_2</i> Podman
      </p>
      <ul class="project-highlights">
        <li>Reproducible dev environment using Nix Flakes with NVIDIA drivers &amp; GPU-accelerated Android emulators</li>
        <li>Portable container orchestration with Podman-compose across NixOS and macOS</li>
      </ul>
    </article>
  </BentoTile>

  <!-- ── Skills (4 cluster tiles) ───────────────────────────────────────── -->
  {#each skills as group, idx (group.category)}
    <BentoTile
      id={skillCategoryIdMap[group.category]}
      priority="tertiary"
      cluster="skills"
      clusterOrder={idx + 1}
      minWidth={180}
      minHeight={140}
      aspectRatio={meta[skillCategoryIdMap[group.category]].aspectRatio}
      ariaLabelledby={`skill-h-${idx}`}
    >
      <div class="card skill-category">
        <div class="skill-icon"><i>{skillIcons[idx] ?? "code"}</i></div>
        <h4 id={`skill-h-${idx}`}>{group.category}</h4>
        <ul>
          {#each group.items as item (item)}
            <li><span class="skill-dot"></span>{item}</li>
          {/each}
        </ul>
      </div>
    </BentoTile>
  {/each}

  <!-- ── Certifications (with PDF modal) ────────────────────────────────── -->
  <BentoTile id="certs" priority="quaternary" placement="fill" minWidth={240} minHeight={100} aspectRatio={meta["certs"].aspectRatio} ariaLabelledby="certs-h">
    <div class="card certs-card" bind:this={certSection}>
      <div class="tile-head">
        <span class="tile-icon"><i class="small">workspace_premium</i></span>
        <h2 id="certs-h">Certifications</h2>
      </div>
      <div class="row">
        <button type="button" class="chip cert-badge" onclick={openPdf}>
          <i class="small">verified</i> Ekahau ECSE Design
        </button>
        <div class="chip cert-badge">
          <i class="small">verified</i> Cisco Meraki ECMS1
        </div>
      </div>
    </div>
  </BentoTile>

  <!-- ── Footer ─────────────────────────────────────────────────────────── -->
  <BentoTile id="footer" priority="quaternary" placement="fill" minWidth={280} minHeight={60} aspectRatio={meta["footer"].aspectRatio} ariaLabelledby="footer-h">
    <div class="card footer-card">
      <span id="footer-h" class="footer-logo">
        <span class="b">&lt;</span><span>VK</span><span class="b">/&gt;</span>
      </span>
      <p class="footer-text">
        Genned by clankers guided by the firm promt (and some display of hard skills) of Vladimir
        Kolchurin &copy; {new Date().getFullYear()}
      </p>
    </div>
  </BentoTile>
</BentoLayout>

{#if showPdf}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="pdf-modal"
    onclick={(e) => e.currentTarget === e.target && closePdf()}
    onkeydown={(e) => e.key === "Escape" && closePdf()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="pdf-content" role="document">
      <iframe src={EKAHUA_ECSE_CERTIFICATE_PATH} title="Ekahau ECSE Certificate"></iframe>
    </div>
  </div>
{/if}

<style>
/* Reserve the scrollbar gutter so it appearing (once the wall is taller than
   the viewport) doesn't shrink the width and trigger a one-off re-pack. */
:global(html) {
  scrollbar-gutter: stable;
}

.skip-links {
  position: absolute;
  left: -9999px;
}
.skip-links a:focus {
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: 9999;
  padding: 8px 12px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--accent);
  border-radius: 6px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.card {
  width: 100%;
  height: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-sizing: border-box;
  overflow: hidden;
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
}

/* shared mini section-header (icon + title), matching homepage iconography */
.tile-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.tile-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--accent), var(--accent-dim));
  border-radius: 12px;
  color: var(--bg-primary);
}
.tile-head h2 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* ── header ─────────────────────────────────────────────────────────── */
.header-card {
  flex-direction: row;
  align-items: center;
  gap: 1.1rem;
}
.avatar {
  flex-shrink: 0;
  width: 96px;
  height: 96px;
  margin: 0;
  border: 3px solid var(--border);
  background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
  overflow: hidden;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}
.header-text {
  min-width: 0;
  flex: 1;
}
.name {
  font-family: "Space Mono", monospace;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  line-height: 1.1;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.tagline {
  font-size: 1.5rem;
  color: var(--accent);
  font-weight: 500;
  margin: 0 0 0.75rem 0;
}
.contact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.command-line {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: "Space Mono", monospace;
  font-size: 0.95rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  text-decoration: none;
  width: fit-content;
  max-width: 100%;
}
.command-line:hover {
  border-color: var(--accent);
}
.command-line .prompt {
  color: var(--accent);
  font-weight: 700;
}
.command-line .arg {
  color: var(--text-muted);
}
.command-line .value {
  color: var(--accent);
}
.contact-secondary {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  font-size: 0.85rem;
}
.secondary-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-secondary);
  font-family: "Space Mono", monospace;
  text-decoration: none;
}
.secondary-link:hover {
  color: var(--accent);
}
.secondary-link i {
  color: var(--accent);
}

/* ── status badge ───────────────────────────────────────────────────── */
.status-card {
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 0.6rem 0.9rem;
  font-family: "Space Mono", monospace;
  font-size: 0.95rem;
}
.status-card .prompt {
  color: var(--accent);
  font-weight: 700;
}
.status-text {
  color: #22c55e;
  white-space: nowrap;
}
.cursor-blink {
  color: var(--accent);
  animation: cursor-blink 1.1s steps(1) infinite;
}
@keyframes cursor-blink {
  50% {
    opacity: 0;
  }
}

/* ── about ──────────────────────────────────────────────────────────── */
.about-text {
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin: 0;
}
.highlight {
  color: var(--accent);
  font-weight: 500;
}
.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 2.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
  margin-top: 0.5rem;
}
.stat {
  display: flex;
  flex-direction: column;
}
.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent);
}
.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* ── terminal ───────────────────────────────────────────────────────── */
.terminal-card {
  padding: 0.4rem;
}
.terminal-card :global(.terminal) {
  height: 100%;
}
.terminal-card :global(.terminal-window) {
  height: 100%;
  margin: 0;
}

/* ── experience timeline ────────────────────────────────────────────── */
.experience-card .timeline {
  position: relative;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.timeline-item {
  display: flex;
  gap: 0.9rem;
}
.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.marker-dot {
  width: 12px;
  height: 12px;
  background-color: var(--accent);
  border-radius: 50%;
  box-shadow:
    0 0 0 3px var(--bg-secondary),
    0 0 0 4px var(--accent);
}
.marker-line {
  width: 2px;
  flex: 1;
  background: linear-gradient(180deg, var(--accent) 0%, var(--border) 100%);
  margin-top: 0.4rem;
}
.timeline-content {
  flex: 1;
  min-width: 0;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
}
.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.25rem;
}
.timeline-company {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}
.timeline-period {
  font-size: 0.85rem;
  color: var(--text-muted);
}
.timeline-title {
  font-size: 0.95rem;
  color: var(--accent);
  margin-bottom: 0.75rem;
}
.timeline ul {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.timeline li {
  padding: 0.35rem 0 0.35rem 1.25rem;
  position: relative;
  line-height: 1.5;
}
.timeline li::before {
  content: "▹";
  position: absolute;
  left: 0;
  color: var(--accent);
}

/* ── projects ───────────────────────────────────────────────────────── */
.project-card {
  position: relative;
  gap: 0.5rem;
}
.project-card .chip {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  padding: 0.2rem 0.6rem;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--accent);
  color: var(--bg-primary);
  border-radius: 6px;
}
.project-card .chip.dev {
  background: #8b5cf6;
}
.project-card .chip.building {
  background: #10b981;
}
.project-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  padding-right: 3.5rem;
  font-family: "Space Mono", monospace;
}
.project-stack {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
  font-family: "Space Mono", monospace;
}
.project-stack i {
  color: var(--accent);
}
.separator {
  color: var(--border);
}
.project-highlights {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  overflow-y: auto;
}
.project-highlights li {
  padding: 0.5rem 0 0.5rem 1.5rem;
  position: relative;
  border-bottom: 1px solid var(--border);
  line-height: 1.5;
}
.project-highlights li:last-child {
  border-bottom: none;
}
.project-highlights li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: var(--accent);
}

/* currently building */
.current-card pre.current-body {
  font-family: "Space Mono", monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
  white-space: pre-wrap;
  flex: 1;
  overflow-y: auto;
}
.terminal-hint {
  font-size: 0.7rem;
  color: var(--text-muted);
}
.terminal-hint code {
  background: var(--bg-tertiary);
  padding: 0.05rem 0.35rem;
  border-radius: 4px;
  font-family: "Space Mono", monospace;
}

/* ── skills ─────────────────────────────────────────────────────────── */
.skill-category {
  gap: 0.5rem;
}
.skill-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(34, 211, 238, 0.1);
  border-radius: 10px;
  color: var(--accent);
}
.skill-category h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  font-family: "Space Mono", monospace;
}
.skill-category ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.skill-category li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.35rem 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.skill-dot {
  width: 6px;
  height: 6px;
  background-color: var(--accent);
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── certifications ─────────────────────────────────────────────────── */
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
}
.cert-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  color: var(--text-primary);
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: border-color 0.2s;
  font-family: inherit;
  cursor: default;
}
button.cert-badge {
  cursor: pointer;
}
.cert-badge:hover {
  border-color: var(--accent);
}
.cert-badge i {
  color: var(--accent);
}

/* ── footer ─────────────────────────────────────────────────────────── */
.footer-card {
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.5rem;
}
.footer-logo {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: "Space Mono", monospace;
}
.footer-logo .b {
  color: var(--accent);
}
.footer-text {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.6;
}

/* ── pdf modal ──────────────────────────────────────────────────────── */
.pdf-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.pdf-content {
  position: relative;
  width: 100%;
  max-width: 900px;
  height: 90vh;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
.pdf-content iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
