<script lang="ts">
import BentoLayout from "$lib/components/BentoLayout.svelte"
import BentoTile from "$lib/components/BentoTile.svelte"
import Terminal from "$lib/components/Terminal.svelte"
import { BENTO_ADJACENCY } from "$lib/bento/inventory"
import {
  contact,
  skills,
  experience,
  projects,
  currentlyBuilding,
  statusBadge,
} from "$lib/profile"

const skillCategoryIdMap: Record<string, string> = {
  "Backend & Databases": "skills-backend",
  "Cloud & DevOps": "skills-cloud",
  "Networking & Systems": "skills-networking",
  "AI Infrastructure": "skills-ai",
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
  <BentoTile id="header" priority="secondary" minWidth={320} minHeight={180} ariaLabelledby="header-h">
    <div class="card header-card">
      <figure class="avatar"><img src="/headshot.webp" alt="Vladimir Kolchurin" /></figure>
      <div class="header-text">
        <h1 id="header-h" class="name">Vladimir Kolchurin</h1>
        <p class="tagline">Backend &amp; Systems Engineer</p>
        <a href={`mailto:${contact.email}`} class="header-link">
          <span class="prompt">❯</span>
          <span class="cmd">contact</span>
          <span class="value">{contact.email}</span>
        </a>
      </div>
    </div>
  </BentoTile>

  <BentoTile
    id="status-badge"
    priority="quaternary"
    placement="feature"
    minWidth={160}
    minHeight={36}
    ariaLabelledby="status-h"
  >
    <div class="card status-card">
      <span id="status-h" class="status-dot" aria-hidden="true"></span>
      <span class="status-text">{statusBadge.label}</span>
      <span class="cursor-blink" aria-hidden="true">▌</span>
    </div>
  </BentoTile>

  <BentoTile id="about" priority="tertiary" minWidth={260} minHeight={180} ariaLabelledby="about-h">
    <div class="card about-card">
      <h2 id="about-h">About</h2>
      <p>
        I build <span class="hi">resilient backend architectures</span>, distributed data pipelines,
        and declarative dev environments. Background in enterprise networking; DevOps-first mindset.
      </p>
      <div class="stats">
        <div><span class="stat-v">7+</span><span class="stat-l">Years</span></div>
        <div><span class="stat-v">5</span><span class="stat-l">Companies</span></div>
        <div><span class="stat-v">2</span><span class="stat-l">Certs</span></div>
      </div>
    </div>
  </BentoTile>

  <BentoTile
    id="terminal"
    priority="primary"
    minWidth={560}
    minHeight={360}
    ariaLabelledby="terminal-h"
  >
    <div class="card terminal-card">
      <h2 id="terminal-h" class="sr-only">Terminal</h2>
      <Terminal />
    </div>
  </BentoTile>

  <BentoTile
    id="experience"
    priority="secondary"
    minWidth={280}
    minHeight={360}
    ariaLabelledby="exp-h"
  >
    <div class="card experience-card">
      <h2 id="exp-h">Experience</h2>
      <ol class="timeline">
        {#each experience as job (job.company)}
          <li>
            <div class="job-head">
              <span class="job-company">{job.company}</span>
              <span class="job-period">{job.period}</span>
            </div>
            <div class="job-title">{job.title}</div>
          </li>
        {/each}
      </ol>
    </div>
  </BentoTile>

  <BentoTile
    id="projects-currently-building"
    priority="tertiary"
    cluster="projects"
    clusterOrder={1}
    minWidth={240}
    minHeight={200}
    ariaLabelledby="cb-h"
  >
    <div class="card current-card">
      <h2 id="cb-h">Currently Building</h2>
      <pre class="current-body">{currentlyBuilding}</pre>
      <small class="terminal-hint">
        also: <code>cat current.md</code> in the terminal
      </small>
    </div>
  </BentoTile>

  <BentoTile
    id="projects-ai-lab"
    priority="tertiary"
    cluster="projects"
    clusterOrder={2}
    minWidth={240}
    minHeight={200}
    ariaLabelledby="proj-ai-h"
  >
    <div class="card project-card">
      <h2 id="proj-ai-h">{projects[0].name}</h2>
      <p class="project-tags">{projects[0].tags.join(" · ")}</p>
      <ul>
        {#each projects[0].highlights as h (h)}
          <li>{h}</li>
        {/each}
      </ul>
    </div>
  </BentoTile>

  <BentoTile
    id="projects-dev-sandbox"
    priority="tertiary"
    cluster="projects"
    clusterOrder={3}
    minWidth={240}
    minHeight={200}
    ariaLabelledby="proj-dev-h"
  >
    <div class="card project-card">
      <h2 id="proj-dev-h">{projects[1].name}</h2>
      <p class="project-tags">{projects[1].tags.join(" · ")}</p>
      <ul>
        {#each projects[1].highlights as h (h)}
          <li>{h}</li>
        {/each}
      </ul>
    </div>
  </BentoTile>

  {#each skills as group, idx (group.category)}
    <BentoTile
      id={skillCategoryIdMap[group.category]}
      priority="tertiary"
      cluster="skills"
      clusterOrder={idx + 1}
      minWidth={180}
      minHeight={140}
      ariaLabelledby={`skill-h-${idx}`}
    >
      <div class="card skill-card">
        <h3 id={`skill-h-${idx}`}>{group.category}</h3>
        <ul>
          {#each group.items as item (item)}
            <li>{item}</li>
          {/each}
        </ul>
      </div>
    </BentoTile>
  {/each}

  <BentoTile
    id="certs"
    priority="quaternary"
    placement="fill"
    minWidth={240}
    minHeight={100}
    ariaLabelledby="certs-h"
  >
    <div class="card certs-card">
      <h2 id="certs-h">Certifications</h2>
      <div class="cert-list">
        <span class="cert">Ekahau ECSE Design</span>
        <span class="cert">Cisco Meraki ECMS1</span>
      </div>
    </div>
  </BentoTile>

  <BentoTile
    id="footer"
    priority="quaternary"
    placement="fill"
    minWidth={280}
    minHeight={60}
    ariaLabelledby="footer-h"
  >
    <div class="card footer-card">
      <span id="footer-h" class="footer-logo">
        <span class="b">&lt;</span><span>VK</span><span class="b">/&gt;</span>
      </span>
      <span class="footer-meta">© {new Date().getFullYear()} · {contact.github}</span>
    </div>
  </BentoTile>
</BentoLayout>

<style>
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
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-sizing: border-box;
  overflow: hidden;
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
}

.card h2,
.card h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--accent);
  font-family: "Space Mono", monospace;
}

.card h3 {
  font-size: 0.85rem;
}

/* header */
.header-card {
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.avatar {
  flex-shrink: 0;
  width: 88px;
  height: 88px;
  margin: 0;
  border: 2px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-text {
  min-width: 0;
  flex: 1;
}

.name {
  font-family: "Space Mono", monospace;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary) !important;
  margin: 0;
  line-height: 1.1;
}

.tagline {
  font-size: 0.9rem;
  color: var(--accent);
  margin: 0.15rem 0 0.4rem 0;
}

.header-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: "Space Mono", monospace;
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-decoration: none;
}

.header-link .prompt {
  color: var(--accent);
  font-weight: 700;
}

.header-link .value {
  color: var(--accent);
}

/* status badge */
.status-card {
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.8rem;
  font-family: "Space Mono", monospace;
  font-size: 0.8rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
  box-shadow: 0 0 8px #22c55e;
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

/* about */
.about-card p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.hi {
  color: var(--accent);
  font-weight: 500;
}

.stats {
  display: flex;
  gap: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
  margin-top: auto;
}

.stats > div {
  display: flex;
  flex-direction: column;
}

.stat-v {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent);
}

.stat-l {
  font-size: 0.7rem;
  color: var(--text-muted);
}

/* terminal tile — let the Terminal component drive its own padding */
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

/* experience */
.experience-card .timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow: hidden;
}

.experience-card li {
  border-left: 2px solid var(--accent-dim);
  padding-left: 0.65rem;
}

.job-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.78rem;
}

.job-company {
  font-weight: 600;
  color: var(--text-primary);
}

.job-period {
  color: var(--text-muted);
  font-size: 0.7rem;
}

.job-title {
  color: var(--accent);
  font-size: 0.74rem;
  margin-top: 0.1rem;
}

/* currently building */
.current-card pre.current-body {
  font-family: "Space Mono", monospace;
  font-size: 0.72rem;
  line-height: 1.35;
  color: var(--text-secondary);
  margin: 0;
  white-space: pre-wrap;
  flex: 1;
  overflow: hidden;
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

/* projects */
.project-card h2 {
  font-size: 0.95rem;
}

.project-tags {
  font-family: "Space Mono", monospace;
  font-size: 0.7rem;
  color: var(--text-muted);
  margin: 0;
}

.project-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
}

.project-card li {
  padding-left: 0.9rem;
  position: relative;
  line-height: 1.35;
}

.project-card li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: var(--accent);
}

/* skills */
.skill-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.78rem;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.skill-card li::before {
  content: "·";
  color: var(--accent);
  margin-right: 0.4rem;
}

/* certifications */
.certs-card .cert-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
}

.certs-card .cert {
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
}

/* footer */
.footer-card {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  font-family: "Space Mono", monospace;
  font-size: 0.75rem;
}

.footer-logo .b {
  color: var(--accent);
}

.footer-meta {
  color: var(--text-muted);
}
</style>
