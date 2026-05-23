<script lang="ts">
import { onMount } from "svelte"
import MasonryLayout from "$lib/components/MasonryLayout.svelte"
import Tile from "$lib/components/Tile.svelte"
import Terminal from "$lib/components/Terminal.svelte"
import { contact, skills, experience, projects } from "$lib/profile"
import { EKAHUA_ECSE_CERTIFICATE_PATH } from "$lib/routes/certificates"

const priorities = {
  experience: 10,
  skills: 8,
  about: 6,
  terminal: 5,
  projects: 4,
  header: 3,
  certs: 2,
  footer: 1,
}

let showPdf = $state(false)

function openPdf() {
  showPdf = true
}
function closePdf() {
  showPdf = false
}

onMount(() => {
  document.body.classList.add("masonry-active")
  return () => document.body.classList.remove("masonry-active")
})
</script>

<svelte:head>
  <title>grid-v4 — priority-anchored layout</title>
</svelte:head>

<MasonryLayout gutter={12} anchor="terminal" anchorSize={{ w: 720, h: 520 }}>
  <Tile id="experience" priority={priorities.experience} minWidth={320} minHeight={240}>
    <div class="card experience-card">
      <header class="card-header">
        <span class="card-icon"><i class="extra">work</i></span>
        <h2>Experience</h2>
      </header>
      <ol class="timeline">
        {#each experience.slice(0, 3) as job}
          <li class="job">
            <div class="job-head">
              <span class="job-company">{job.company}</span>
              <span class="job-period">{job.period}</span>
            </div>
            <div class="job-title">{job.title}</div>
            <p class="job-summary">{job.highlights[0]}</p>
          </li>
        {/each}
      </ol>
    </div>
  </Tile>

  <Tile id="skills" priority={priorities.skills} minWidth={260} minHeight={200}>
    <div class="card skills-card">
      <header class="card-header">
        <span class="card-icon"><i class="extra">bolt</i></span>
        <h2>Skills</h2>
      </header>
      <div class="skills-grid">
        {#each skills as group}
          <div class="skill-group">
            <h4>{group.category}</h4>
            <ul>
              {#each group.items.slice(0, 3) as item}
                <li>{item}</li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </div>
  </Tile>

  <Tile id="about" priority={priorities.about} minWidth={260} minHeight={180}>
    <div class="card about-card">
      <header class="card-header">
        <span class="card-icon"><i class="extra">person</i></span>
        <h2>About</h2>
      </header>
      <p>
        I build <span class="hi">resilient backend architectures</span>, distributed data
        pipelines, and declarative dev environments. With a background in enterprise networking
        and a <span class="hi">DevOps-first</span> mindset, I excel at solving complex
        synchronization and infrastructure challenges.
      </p>
      <div class="stats">
        <div><span class="stat-v">7+</span><span class="stat-l">Years</span></div>
        <div><span class="stat-v">5</span><span class="stat-l">Companies</span></div>
        <div><span class="stat-v">2</span><span class="stat-l">Certs</span></div>
      </div>
    </div>
  </Tile>

  <Tile id="terminal" priority={priorities.terminal} minWidth={320} minHeight={220}>
    <div class="card terminal-card">
      <Terminal />
    </div>
  </Tile>

  <Tile id="projects" priority={priorities.projects} minWidth={260} minHeight={200}>
    <div class="card projects-card">
      <header class="card-header">
        <span class="card-icon"><i class="extra">folder</i></span>
        <h2>Projects</h2>
      </header>
      <div class="project-list">
        {#each projects as project}
          <article class="project">
            <h3>{project.name}</h3>
            <p class="project-tags">{project.tags.join(" · ")}</p>
            <p class="project-summary">{project.highlights[0]}</p>
          </article>
        {/each}
      </div>
    </div>
  </Tile>

  <Tile id="header" priority={priorities.header} minWidth={280} minHeight={180}>
    <div class="card header-card">
      <figure class="avatar"><img src="/headshot.webp" alt="Vladimir Kolchurin" /></figure>
      <div class="header-text">
        <div class="status-line">
          <span class="prompt">❯</span>
          <span class="status">Available for projects</span>
        </div>
        <h1>Vladimir Kolchurin</h1>
        <p class="tagline">Backend &amp; Systems Engineer</p>
        <a href={`mailto:${contact.email}`} class="header-link">
          <i class="tiny">mail</i>
          {contact.email}
        </a>
      </div>
    </div>
  </Tile>

  <Tile id="certs" priority={priorities.certs} minWidth={200} minHeight={140}>
    <div class="card certs-card">
      <header class="card-header">
        <span class="card-icon"><i class="extra">workspace_premium</i></span>
        <h2>Certifications</h2>
      </header>
      <div class="cert-list">
        <button type="button" class="cert" onclick={openPdf}>
          <i class="small">verified</i>
          Ekahau ECSE Design
        </button>
        <div class="cert">
          <i class="small">verified</i>
          Cisco Meraki ECMS1
        </div>
      </div>
    </div>
  </Tile>

  <Tile id="footer" priority={priorities.footer} minWidth={180} minHeight={100}>
    <div class="card footer-card">
      <div class="footer-logo">
        <span>&lt;</span><span>VK</span><span>/&gt;</span>
      </div>
      <p>
        <a href={`https://${contact.github}`} target="_blank" rel="noopener">{contact.github}</a>
        · &copy; {new Date().getFullYear()}
      </p>
    </div>
  </Tile>
</MasonryLayout>

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
:global(body.masonry-active) {
  margin: 0;
  overflow: hidden;
}

.card {
  width: 100%;
  height: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dim));
  border-radius: 8px;
  color: var(--bg-primary);
  flex-shrink: 0;
}

.card-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.experience-card .timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.job {
  border-left: 2px solid var(--accent-dim);
  padding-left: 0.75rem;
}

.job-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.job-company {
  font-weight: 600;
  color: var(--text-primary);
}

.job-period {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.job-title {
  color: var(--accent);
  font-size: 0.8rem;
  margin: 0.1rem 0 0.25rem 0;
}

.job-summary {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.35;
}

.skills-card .skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.skill-group {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 0.5rem 0.6rem;
}

.skill-group h4 {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent);
  margin: 0 0 0.25rem 0;
}

.skill-group ul {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.skill-group li {
  padding: 0.1rem 0;
}

.about-card p {
  font-size: 0.9rem;
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
  padding-top: 0.6rem;
  border-top: 1px solid var(--border);
  margin-top: auto;
}

.stats > div {
  display: flex;
  flex-direction: column;
}

.stat-v {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--accent);
}

.stat-l {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.terminal-card {
  padding: 0.5rem;
  overflow: hidden;
}

.terminal-card :global(.terminal) {
  height: 100%;
}

.terminal-card :global(.terminal-window) {
  height: 100%;
  margin: 0;
}

.projects-card .project-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.project {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
}

.project h3 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.project-tags {
  font-family: "Space Mono", monospace;
  font-size: 0.7rem;
  color: var(--text-muted);
  margin: 0.15rem 0 0.3rem 0;
}

.project-summary {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.header-card {
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 80px;
  height: 80px;
  margin: 0;
  border: 2px solid var(--border);
  overflow: hidden;
  flex-shrink: 0;
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

.status-line {
  font-family: "Space Mono", monospace;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.3rem;
}

.prompt {
  color: var(--accent);
}

.status {
  color: #22c55e;
}

.header-text h1 {
  font-family: "Space Mono", monospace;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.1;
  color: var(--text-primary);
}

.tagline {
  font-size: 0.85rem;
  color: var(--accent);
  margin: 0.15rem 0 0.4rem 0;
}

.header-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: "Space Mono", monospace;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.certs-card .cert-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.cert {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.4rem 0.7rem;
  font-size: 0.8rem;
  color: var(--text-primary);
  cursor: pointer;
  width: fit-content;
}

.cert:hover {
  border-color: var(--accent);
}

.footer-card {
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.3rem;
}

.footer-logo {
  font-family: "Space Mono", monospace;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  gap: 0.1rem;
}

.footer-logo span:first-child,
.footer-logo span:last-child {
  color: var(--accent);
}

.footer-card p {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin: 0;
}

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
