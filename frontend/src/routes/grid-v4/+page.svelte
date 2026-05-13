<script lang="ts">
  import { onMount } from "svelte";
  import Terminal from "$lib/components/Terminal.svelte";
  import { contact, skills, experience } from "$lib/profile";
  import { EKAHUA_ECSE_CERTIFICATE_PATH } from "$lib/routes/certificates";
  import { computeFluidLayout } from "$lib/routes/layout-logic";

  let showPdf = $state(false);
  let viewportWidth = $state(1920);

  interface Section {
    id: string;
    name: string;
    priority: number;
    content:
      | "header"
      | "terminal"
      | "about"
      | "skills"
      | "experience"
      | "projects"
      | "certs"
      | "footer";
  }

  let sections: Section[] = $state([
    { id: "experience", name: "Experience", priority: 10, content: "experience" },
    { id: "skills", name: "Skills", priority: 8, content: "skills" },
    { id: "about", name: "About", priority: 6, content: "about" },
    { id: "terminal", name: "Terminal", priority: 5, content: "terminal" },
    { id: "projects", name: "Projects", priority: 4, content: "projects" },
    { id: "header", name: "Header", priority: 3, content: "header" },
    { id: "certs", name: "Certifications", priority: 2, content: "certs" },
    { id: "footer", name: "Footer", priority: 1, content: "footer" },
  ]);

  let layout = $state(computeFluidLayout(sections, viewportWidth));

  onMount(() => {
    viewportWidth = window.innerWidth;
    const handleResize = () => {
      viewportWidth = window.innerWidth;
      layout = computeFluidLayout(sections, viewportWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  function getGridStyle(item: (typeof layout)[0]): string {
    const cols = viewportWidth > 1600 ? 5 : viewportWidth > 1200 ? 4 : viewportWidth > 800 ? 3 : 2;
    return `grid-column: span ${Math.min(item.colSpan, cols)}; grid-row: span ${item.rowSpan};`;
  }

  function getColCount(): number {
    return viewportWidth > 1600 ? 5 : viewportWidth > 1200 ? 4 : viewportWidth > 800 ? 3 : 2;
  }

  function openPdf() {
    showPdf = true;
  }

  function closePdf() {
    showPdf = false;
  }
</script>

<div class="fluid-layout">
  <div class="fluid-grid" style="--cols: {getColCount()};">
    {#each layout as item}
      <div
        class="fluid-card"
        data-priority={item.priority}
        style={getGridStyle(item)}
      >
        {#if sections.find((s) => s.id === item.id)?.content === "header"}
          <div class="cell-content header-cell">
            <figure class="avatar">
              <img src="/headshot.webp" alt="Vladimir Kolchurin" />
            </figure>
            <div class="header-text">
              <div class="status-line">
                <span class="prompt">❯</span>
                <span class="status">Available for projects</span>
              </div>
              <h1 class="name">Vladimir Kolchurin</h1>
              <p class="tagline">Backend & Systems Engineer</p>
              <div class="contact-secondary">
                <a href="mailto:{contact.email}" class="command-line">
                  <span class="prompt">❯</span>
                  <span class="cmd">contact</span>
                  <span class="arg">--email</span>
                  <span class="value">{contact.email}</span>
                </a>
                <div class="contact-links">
                  <a
                    href="https://{contact.github}"
                    target="_blank"
                    rel="noopener"
                    class="secondary-link"
                  >
                    <i>code</i>
                    {contact.github}
                  </a>
                  <a
                    href="tel:{contact.phone.replace(/\s/g, "")}"
                    class="secondary-link"
                  >
                    <i>phone</i>
                    {contact.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        {:else if sections.find((s) => s.id === item.id)?.content === "terminal"}
          <div class="cell-content terminal-cell"><Terminal /></div>
        {:else if sections.find((s) => s.id === item.id)?.content === "about"}
          <div class="cell-content about-cell">
            <div class="section-header">
              <span class="section-icon"><i class="extra">person</i></span>
              <h2 class="section-title">About</h2>
            </div>
            <p class="about-text">
              I specialize in building
              <span class="highlight">resilient backend architectures</span>,
              distributed data pipelines, and declarative development
              environments. With a background in enterprise networking and a
              <span class="highlight">DevOps-first</span> mindset, I excel at
              solving complex synchronization and infrastructure challenges.
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
        {:else if sections.find((s) => s.id === item.id)?.content === "skills"}
          <div class="cell-content skills-cell">
            <div class="section-header">
              <span class="section-icon"><i class="extra">bolt</i></span>
              <h2 class="section-title">Technical Skills</h2>
            </div>
            <div class="skills-grid">
              {#each skills as skill, si}
                <div class="skill-category">
                  <div class="skill-icon">
                    {#if si === 0}
                      <i>dns</i>
                    {:else if si === 1}
                      <i>cloud</i>
                    {:else if si === 2}
                      <i>router</i>
                    {:else}
                      <i>psychology</i>
                    {/if}
                  </div>
                  <h4>{skill.category}</h4>
                  <ul>
                    {#each skill.items as item}
                      <li><span class="skill-dot"></span>{item}</li>
                    {/each}
                  </ul>
                </div>
              {/each}
            </div>
          </div>
        {:else if sections.find((s) => s.id === item.id)?.content === "experience"}
          <div class="cell-content experience-cell">
            <div class="section-header">
              <span class="section-icon"><i class="extra">work</i></span>
              <h2 class="section-title">Experience</h2>
            </div>
            <div class="timeline">
              {#each experience as job, ji}
                <div class="timeline-item">
                  <div class="timeline-marker">
                    <div class="marker-dot"></div>
                    {#if ji < experience.length - 1}
                      <div class="marker-line"></div>
                    {/if}
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <span class="timeline-company">{job.company}</span>
                      <span class="timeline-period">{job.period}</span>
                    </div>
                    <div class="timeline-title">{job.title}</div>
                    <ul class="job-highlights">
                      {#each job.highlights as highlight}
                        <li>{highlight}</li>
                      {/each}
                    </ul>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {:else if sections.find((s) => s.id === item.id)?.content === "projects"}
          <div class="cell-content projects-cell">
            <div class="section-header">
              <span class="section-icon"><i class="extra">folder</i></span>
              <h2 class="section-title">Side Projects</h2>
            </div>
            <article class="project-card">
              <div class="chip">AI</div>
              <h3>Hybrid AI & Infrastructure Lab</h3>
              <p class="project-stack">
                <i class="tiny">cloud</i>Docker Compose<span class="sep">•</span
                ><i class="tiny">language</i>Traefik<span class="sep">•</span
                ><i class="tiny">vpn</i>WireGuard
              </p>
              <ul class="project-highlights">
                <li>
                  Multi-node AI inference system with Docker Compose and Traefik
                  reverse proxy
                </li>
                <li>
                  Secure routing between public VPS services and private Ollama
                  via WireGuard
                </li>
              </ul>
            </article>
            <article class="project-card">
              <div class="chip dev">Dev</div>
              <h3>Declarative Development Sandbox</h3>
              <p class="project-stack">
                <i class="tiny">code</i>NixOS<span class="sep">•</span><i
                  class="tiny"
                  >inventory_2</i
                >Podman
              </p>
              <ul class="project-highlights">
                <li>
                  Reproducible dev environment using Nix Flakes with NVIDIA
                  drivers
                </li>
                <li>
                  Portable container orchestration with Podman-compose across
                  platforms
                </li>
              </ul>
            </article>
          </div>
        {:else if sections.find((s) => s.id === item.id)?.content === "certs"}
          <div class="cell-content certs-cell">
            <div class="section-header">
              <span class="section-icon"
                ><i class="extra">workspace_premium</i></span
              >
              <h2 class="section-title">Certifications</h2>
            </div>
            <div class="certs-list">
              <button type="button" class="cert-badge" onclick={openPdf}>
                <i class="small">verified</i>Ekahau ECSE Design
              </button>
              <div class="cert-badge">
                <i class="small">verified</i>Cisco Meraki ECMS1
              </div>
            </div>
          </div>
        {:else if sections.find((s) => s.id === item.id)?.content === "footer"}
          <div class="cell-content footer-cell">
            <div class="footer-logo">
              <span class="logo-bracket">&lt;</span>
              <span class="logo-text">VK</span>
              <span class="logo-bracket">/&gt;</span>
            </div>
            <p>&copy; {new Date().getFullYear()} Vladimir Kolchurin</p>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

{#if showPdf}
  <div
    class="pdf-modal"
    onclick={(e) => e.currentTarget === e.target && closePdf()}
    onkeydown={(e) => e.key === "Escape" && closePdf()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="pdf-content" role="document">
      <iframe
        src={EKAHUA_ECSE_CERTIFICATE_PATH}
        title="Ekahau ECSE Certificate"
      ></iframe>
    </div>
  </div>
{/if}

<style>
  .fluid-layout {
    min-height: 100vh;
    padding: 1.5rem;
    padding-top: 5rem;
    background: var(--bg-primary);
  }

  .fluid-grid {
    display: grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    grid-auto-rows: minmax(120px, auto);
    gap: 0.75rem;
    grid-auto-flow: dense;
  }

  .fluid-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
    transition:
      border-color 0.2s,
      transform 0.2s;
    overflow: auto;
  }

  .fluid-card:hover {
    border-color: var(--accent);
  }

  .fluid-card[data-priority="10"] {
    border-color: var(--accent);
    border-width: 2px;
  }

  .fluid-card[data-priority="8"] {
    border-color: var(--accent-dim);
    border-width: 1.5px;
  }

  .cell-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-shrink: 0;
  }

  .section-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--accent), var(--accent-dim));
    border-radius: 10px;
    color: var(--bg-primary);
    flex-shrink: 0;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 0;
    border: 3px solid var(--border);
    overflow: hidden;
    flex-shrink: 0;
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .header-cell {
    flex-direction: row;
    gap: 1.5rem;
    align-items: flex-start;
  }

  .header-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .status-line {
    font-family: "Space Mono", monospace;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .prompt {
    color: var(--accent);
  }

  .status {
    color: #22c55e;
  }

  .name {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    line-height: 1.2;
  }

  .tagline {
    font-size: 1rem;
    color: var(--accent);
    font-weight: 500;
    margin: 0 0 0.75rem 0;
  }

  .command-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: "Space Mono", monospace;
    font-size: 0.75rem;
    padding: 0.4rem 0.6rem;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    color: var(--text-primary);
    text-decoration: none;
    width: fit-content;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
  }

  .command-line:hover {
    border-color: var(--accent);
  }

  .cmd {
    color: var(--text-primary);
  }

  .arg {
    color: var(--text-muted);
  }

  .value {
    color: var(--accent);
  }

  .contact-secondary {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .contact-links {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
  }

  .secondary-link {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--text-secondary);
    font-family: "Space Mono", monospace;
  }

  .secondary-link:hover {
    color: var(--accent);
  }

  .terminal-cell {
    padding: 0;
    min-height: 200px;
  }

  .terminal-cell :global(.terminal) {
    height: 100%;
  }

  .terminal-cell :global(.terminal-window) {
    height: 100%;
    border-radius: 12px;
  }

  .about-text {
    font-size: 1rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0 0 1rem 0;
    flex: 1;
  }

  .highlight {
    color: var(--accent);
    font-weight: 500;
  }

  .stats {
    display: flex;
    gap: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
  }

  .stat {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent);
    line-height: 1;
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .skills-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    flex: 1;
    overflow: auto;
  }

  .skill-category {
    padding: 1rem;
    background: var(--bg-tertiary);
    border-radius: 10px;
  }

  .skill-icon {
    width: 32px;
    height: 32px;
    background: rgba(34, 211, 238, 0.1);
    border-radius: 8px;
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  .skill-category h4 {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
  }

  .skill-category ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .skill-category li {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: var(--text-secondary);
    padding: 0.2rem 0;
  }

  .skill-dot {
    width: 5px;
    height: 5px;
    background: var(--accent);
    border-radius: 50%;
  }

  .timeline {
    flex: 1;
    overflow: auto;
  }

  .timeline-item {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .timeline-item:last-child {
    margin-bottom: 0;
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
    background: var(--accent);
    border-radius: 50%;
    box-shadow:
      0 0 0 3px var(--bg-primary),
      0 0 0 4px var(--accent);
  }

  .marker-line {
    width: 2px;
    flex: 1;
    background: linear-gradient(180deg, var(--accent), var(--border));
    margin-top: 0.4rem;
  }

  .timeline-content {
    flex: 1;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1rem;
  }

  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin-bottom: 0.4rem;
  }

  .timeline-company {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .timeline-period {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .timeline-title {
    font-size: 0.85rem;
    color: var(--accent);
    margin: 0 0 0.5rem 0;
  }

  .job-highlights {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .job-highlights li {
    padding: 0.25rem 0;
    padding-left: 0.75rem;
    position: relative;
  }

  .job-highlights li::before {
    content: "▹";
    position: absolute;
    left: 0;
    color: var(--accent);
  }

  .project-card {
    position: relative;
    padding: 1rem;
    background: var(--bg-tertiary);
    border-radius: 10px;
    margin-bottom: 0.75rem;
  }

  .project-card:last-child {
    margin-bottom: 0;
  }

  .project-card .chip {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.2rem 0.5rem;
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    background: var(--accent);
    color: var(--bg-primary);
    border-radius: 4px;
  }

  .project-card .chip.dev {
    background: #8b5cf6;
  }

  .project-card h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.4rem 0;
    padding-right: 3rem;
  }

  .project-stack {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    font-size: 0.75rem;
    color: var(--text-muted);
    margin: 0 0 0.75rem 0;
    font-family: "Space Mono", monospace;
  }

  .sep {
    color: var(--border);
  }

  .project-highlights {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .project-highlights li {
    padding: 0.25rem 0;
    padding-left: 0.75rem;
    position: relative;
  }

  .project-highlights li::before {
    content: "→";
    position: absolute;
    left: 0;
    color: var(--accent);
  }

  .certs-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .cert-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    color: var(--text-primary);
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    width: fit-content;
  }

  .cert-badge:hover {
    border-color: var(--accent);
  }

  .footer-cell {
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .footer-logo {
    font-size: 1rem;
    font-weight: 700;
    font-family: "Space Mono", monospace;
  }

  .logo-bracket {
    color: var(--accent);
  }

  .logo-text {
    color: var(--text-primary);
  }

  .footer-cell p {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin: 0.4rem 0 0 0;
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

  @media (max-width: 600px) {
    .fluid-layout {
      padding: 0.5rem;
      padding-top: 4.5rem;
    }

    .fluid-grid {
      grid-template-columns: 1fr;
    }

    .fluid-card {
      grid-column: span 1 !important;
      grid-row: span 1 !important;
    }

    .header-cell {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .contact-secondary {
      align-items: center;
    }

    .stats {
      justify-content: center;
    }

    .skills-grid {
      grid-template-columns: 1fr;
    }
  }
</style>