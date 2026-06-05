<script lang="ts">
import { onMount } from "svelte"
import Terminal from "$lib/components/Terminal.svelte"
import { contact, skills, experience } from "$lib/profile"
import {
  EKAHUA_ECSE_CERTIFICATE_PATH,
  setupCertificatePreloadOnIntersect,
} from "$lib/routes/certificates"

let showPdf = $state(false)
let certSection: HTMLElement

onMount(() => {
  return setupCertificatePreloadOnIntersect(certSection, document)
})

function openPdf() {
  showPdf = true
}

function closePdf() {
  showPdf = false
}
</script>

<div class="bg-orbs">
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>
</div>

<header class="header">
  <div class="container">
    <div class="header-content">
      <figure class="avatar"><img src="/headshot.webp" alt="Vladimir Kolchurin"></figure>
      <div class="header-text">
        <div class="status-line">
          <span class="prompt">❯</span>
          <span class="status">Available for projects</span>
        </div>
        <h1 class="name">Vladimir Kolchurin</h1>
        <p class="tagline">Backend & Systems Engineer</p>
        <div class="contact">
          <a href="mailto:{contact.email}" class="command-line">
            <span class="prompt">❯</span>
            <span class="cmd">contact</span>
            <span class="arg">--email</span>
            <span class="value">{contact.email}</span>
          </a>
<div class="contact-secondary">
  <a
    href="https://{contact.github}"
    target="_blank"
    rel="noopener"
    class="secondary-link"
  >
    <i class="tiny">code</i>
    {contact.github}
  </a>
  <a
    href="https://{contact.linkedin}"
    target="_blank"
    rel="noopener"
    class="secondary-link"
  >
    <i class="tiny">link</i>
    linkedin
  </a>
  <a href="tel:{contact.phone.replace(/\s/g, '')}" class="secondary-link">
    <i class="tiny">phone</i>
    {contact.phone}
  </a>
</div>
        </div>
      </div>
    </div>
  </div>
</header>

<section class="hero-terminal">
  <div class="container"><Terminal /></div>
</section>

<main>
  <section class="section">
    <div class="container">
      <div class="section-header">
        <span class="section-icon"> <i class="extra">person</i> </span>
        <h2 class="section-title">About</h2>
      </div>
      <div class="card">
        <p class="about-text">
          I specialize in building <span class="highlight">resilient backend architectures</span>,
          distributed data pipelines, and declarative development environments. With a background in
          enterprise networking and a
          <span class="highlight">DevOps-first</span>
          mindset, I excel at solving complex synchronization and infrastructure challenges—moving
          beyond the UI to engineer robust, high-performance systems. Lately I work
          <span class="highlight">AI-first</span>—designing spec-driven, lint- and coverage-gated
          workflows where AI coding agents ship production features safely, staying
          <span class="highlight">tool-agnostic</span>
          across agent harnesses rather than locked to one vendor.
        </p>
        <div class="stats">
          <div class="stat">
            <span class="stat-value">7+</span>
            <span class="stat-label">Years Experience</span>
          </div>
          <div class="stat">
            <span class="stat-value">5</span>
            <span class="stat-label">Companies Served</span>
          </div>
          <div class="stat">
            <span class="stat-value">2</span>
            <span class="stat-label">Certifications</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-header">
        <span class="section-icon"> <i class="extra">bolt</i> </span>
        <h2 class="section-title">Technical Skills</h2>
      </div>
      <div class="grid">
        {#each skills as skill, i}
          <div class="card skill-category" style="--delay: {i * 0.1}s">
            <div class="skill-icon">
              {#if i === 0}
                <i>dns</i>
              {:else if i === 1}
                <i>cloud</i>
              {:else if i === 2}
                <i>router</i>
              {:else}
                <i>psychology</i>
              {/if}
            </div>
            <h4>{skill.category}</h4>
            <ul>
              {#each skill.items as item}
                <li>
                  <span class="skill-dot"></span>
                  {item}
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-header">
        <span class="section-icon"> <i class="extra">work</i> </span>
        <h2 class="section-title">Experience</h2>
      </div>
      <div class="timeline">
        {#each experience as job, i}
          <div class="timeline-item" style="--delay: {i * 0.1}s">
            <div class="timeline-marker">
              <div class="marker-dot"></div>
              {#if i < experience.length - 1}
                <div class="marker-line"></div>
              {/if}
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-company">{job.company}</span>
                <span class="timeline-period">{job.period}</span>
              </div>
              <div class="timeline-title">{job.title}</div>
              <ul>
                {#each job.highlights as highlight}
                  <li>{highlight}</li>
                {/each}
              </ul>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-header">
        <span class="section-icon"> <i class="extra">folder</i> </span>
        <h2 class="section-title">Side Projects</h2>
      </div>
      <div class="grid">
        <article class="card project-card">
          <div class="chip">AI</div>
          <h3>Hybrid AI & Infrastructure Lab</h3>
          <p class="project-stack">
            <i class="tiny">cloud</i>
            Docker Compose
            <span class="separator">•</span>
            <i class="tiny">language</i>
            Traefik
            <span class="separator">•</span>
            <i class="tiny">vpn</i>
            WireGuard
          </p>
          <ul class="project-highlights">
            <li>Multi-node AI inference system with Docker Compose and Traefik reverse proxy</li>
            <li>Secure routing between public VPS services and private Ollama via WireGuard</li>
            <li>Tool-augmented local inference with Open-WebUI + external search APIs</li>
            <li>Custom LLM-powered Neovim workflow (CopilotChat + LiteLLM)</li>
          </ul>
        </article>
        <article class="card project-card">
          <div class="chip dev">Dev</div>
          <h3>Declarative Development Sandbox</h3>
          <p class="project-stack">
            <i class="tiny">code</i>
            NixOS
            <span class="separator">•</span>
            <i class="tiny">inventory_2</i>
            Podman
          </p>
          <ul class="project-highlights">
            <li>
              Reproducible dev environment using Nix Flakes with NVIDIA drivers & GPU-accelerated
              Android emulators
            </li>
            <li>Portable container orchestration with Podman-compose across NixOS and macOS</li>
          </ul>
        </article>
      </div>
    </div>
  </section>

  <section class="section" bind:this={certSection}>
    <div class="container">
      <div class="section-header">
        <span class="section-icon"> <i class="extra">workspace_premium</i> </span>
        <h2 class="section-title">Certifications</h2>
      </div>
      <div class="row">
        <button type="button" class="chip cert-badge" onclick={openPdf}>
          <i class="small">verified</i>
          Ekahau ECSE Design
        </button>
        <div class="chip cert-badge">
          <i class="small">verified</i>
          Cisco Meraki ECMS1
        </div>
      </div>
    </div>
  </section>
</main>

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
      <!---
      <button type="button" class="pdf-close" onclick={closePdf} aria-label="Close">
        <i>close</i>
      </button>
--->
      <iframe
        src={EKAHUA_ECSE_CERTIFICATE_PATH}
        title="Ekahau ECSE Certificate"
      ></iframe>
    </div>
  </div>
{/if}

<footer class="footer">
  <div class="container">
    <div class="footer-content">
      <div class="footer-logo">
        <span class="logo-bracket">&lt;</span>
        <span class="logo-text">VK</span>
        <span class="logo-bracket">/&gt;</span>
      </div>
      <p>
        Genned by clankers guided by the firm promt (and some display of hard skills) of Vladimir
        Kolchurin &copy; {new Date().getFullYear()}
      </p>
    </div>
  </div>
</footer>

<style>
:global(body) {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
}

.bg-orbs {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: var(--accent);
  top: -100px;
  right: -100px;
  animation: float 20s ease-in-out infinite;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: #8b5cf6;
  bottom: 20%;
  left: -100px;
  animation: float 25s ease-in-out infinite reverse;
}

.orb-3 {
  width: 250px;
  height: 250px;
  background: #10b981;
  top: 50%;
  right: 10%;
  animation: float 30s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(20px, -30px);
  }
  50% {
    transform: translate(-20px, 20px);
  }
  75% {
    transform: translate(30px, 30px);
  }
}

.header {
  position: relative;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  border-bottom: 1px solid var(--border);
  padding: 5rem 0;
  overflow: hidden;
}

.header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0);
  background-size: 40px 40px;
  opacity: 0.3;
}

.header-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 3rem;
}

.avatar {
  flex-shrink: 0;
  width: 180px;
  height: 180px;
  border-radius: 0;
  background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
  border: 3px solid var(--border);
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.status-line {
  font-family: "Space Mono", monospace;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.status-line .prompt {
  color: var(--accent);
}

.status-line .status {
  color: #22c55e;
}

.name {
  font-family: "Space Mono", monospace;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.command-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: "Space Mono", monospace;
  font-size: 0.95rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.command-line:hover {
  border-color: var(--accent);
}

.command-line .prompt {
  color: var(--accent);
  font-weight: 700;
}

.command-line .cmd {
  color: var(--text-primary);
}

.command-line .arg {
  color: var(--text-muted);
}

.command-line .value {
  color: var(--accent);
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

.contact-secondary {
  display: flex;
  gap: 1.5rem;
  font-size: 0.85rem;
}

.secondary-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-family: "Space Mono", monospace;
}

.secondary-link:hover {
  color: var(--accent);
}

.secondary-link i {
  color: var(--accent);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.header-text h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  font-size: 1.5rem;
  color: var(--accent);
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.contact {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dim));
  border-radius: 12px;
  color: var(--bg-primary);
}

.section-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
}

.card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2.5rem;
}

.about-text {
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 2rem;
}

.highlight {
  color: var(--accent);
  font-weight: 500;
}

.stats {
  display: flex;
  gap: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
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

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.skill-category {
  padding: 1.5rem;
  transition:
    transform 0.2s,
    border-color 0.2s;
  animation: fadeIn 0.5s ease-out both;
  animation-delay: var(--delay);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.skill-category:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
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
  margin-bottom: 1rem;
}

.skill-category h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.skill-category ul {
  list-style: none;
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
}

.timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  animation: fadeIn 0.5s ease-out both;
  animation-delay: var(--delay);
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.marker-dot {
  width: 16px;
  height: 16px;
  background-color: var(--accent);
  border-radius: 50%;
  box-shadow:
    0 0 0 4px var(--bg-primary),
    0 0 0 5px var(--accent);
}

.marker-line {
  width: 2px;
  flex: 1;
  background: linear-gradient(180deg, var(--accent) 0%, var(--border) 100%);
  margin-top: 0.5rem;
}

.timeline-content {
  flex: 1;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: border-color 0.2s;
}

.timeline-content:hover {
  border-color: var(--accent-dim);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
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
  margin-bottom: 1rem;
}

.timeline ul {
  list-style: none;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.timeline li {
  padding: 0.35rem 0;
  padding-left: 1.25rem;
  position: relative;
}

.timeline li::before {
  content: "▹";
  position: absolute;
  left: 0;
  color: var(--accent);
}

.project-card {
  position: relative;
  padding: 2rem;
  transition:
    transform 0.2s,
    border-color 0.2s;
}

.project-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
}

.project-card .chip {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  margin-bottom: 0;
  padding: 0.25rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.project-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
  padding-right: 5rem;
}

.project-stack {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  font-family: "Space Mono", monospace;
}

.separator {
  color: var(--border);
}

.project-highlights {
  list-style: none;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.project-highlights li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  border-bottom: 1px solid var(--border);
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

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.cert-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  color: var(--text-primary);
  transition: border-color 0.2s;
}

.cert-badge:hover {
  border-color: var(--accent);
}

.footer {
  border-top: 1px solid var(--border);
  padding: 3rem 0;
  margin-top: 2rem;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.footer-logo {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: "Space Mono", monospace;
}

.logo-bracket {
  color: var(--accent);
}

.logo-text {
  color: var(--text-primary);
}

.footer p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.hero-terminal {
  padding: 3rem 0;
  border-bottom: 1px solid var(--border);
}

.hero-terminal :global(.terminal) {
  max-width: 900px;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .avatar {
    width: 150px;
    height: 150px;
  }

  .contact {
    align-items: center;
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .stats {
    flex-wrap: wrap;
    gap: 2rem;
  }
}

@media (max-width: 640px) {
  .header {
    padding: 3rem 0;
  }

  .header-text h1 {
    font-size: 2rem;
  }

  .tagline {
    font-size: 1.25rem;
  }

  .section-title {
    font-size: 1.5rem;
  }
}

.pdf-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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

.cert-badge {
  cursor: pointer;
}
</style>
