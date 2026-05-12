<script lang="ts">
  import { onMount } from "svelte";
  import Terminal from "$lib/components/Terminal.svelte";
  import { contact, skills, experience } from "$lib/profile";
  import { EKAHUA_ECSE_CERTIFICATE_PATH } from "$lib/routes/certificates";
  import { getMasonryColumnCount } from "$lib/routes/layout-logic";

  let showPdf = $state(false);

  interface Section {
    id: string;
    name: string;
    priority: number;
    height: "small" | "medium" | "large" | "xlarge";
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
    {
      id: "header",
      name: "Header",
      priority: 4,
      height: "medium",
      content: "header",
    },
    {
      id: "terminal",
      name: "Terminal",
      priority: 3,
      height: "medium",
      content: "terminal",
    },
    {
      id: "about",
      name: "About",
      priority: 5,
      height: "medium",
      content: "about",
    },
    {
      id: "skills",
      name: "Skills",
      priority: 6,
      height: "medium",
      content: "skills",
    },
    {
      id: "experience",
      name: "Experience",
      priority: 10,
      height: "xlarge",
      content: "experience",
    },
    {
      id: "projects",
      name: "Projects",
      priority: 2,
      height: "large",
      content: "projects",
    },
    {
      id: "certs",
      name: "Certifications",
      priority: 1,
      height: "small",
      content: "certs",
    },
    {
      id: "footer",
      name: "Footer",
      priority: 1,
      height: "small",
      content: "footer",
    },
  ]);

  let columnCount = $state(3);

  onMount(() => {
    function updateColumns() {
      columnCount = getMasonryColumnCount(window.innerWidth);
    }

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  });

  function openPdf() {
    showPdf = true;
  }

  function closePdf() {
    showPdf = false;
  }
</script>

<div class="masonry-layout" style="--cols: {columnCount};">
  <div class="masonry-grid">
    {#each sections as section}
      <div class="masonry-item" data-height={section.height}>
        <div class="masonry-cell">
          {#if section.content === "header"}
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
                      href="tel:{contact.phone.replace(/\s/g, '')}"
                      class="secondary-link"
                    >
                      <i>phone</i>
                      {contact.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          {:else if section.content === "terminal"}
            <div class="cell-content terminal-cell"><Terminal /></div>
          {:else if section.content === "about"}
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
                <span class="highlight">DevOps-first</span> mindset, I excel at solving
                complex synchronization and infrastructure challenges—moving beyond
                the UI to engineer robust, high-performance systems.
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
          {:else if section.content === "skills"}
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
          {:else if section.content === "experience"}
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
          {:else if section.content === "projects"}
            <div class="cell-content projects-cell">
              <div class="section-header">
                <span class="section-icon"><i class="extra">folder</i></span>
                <h2 class="section-title">Side Projects</h2>
              </div>
              <article class="project-card">
                <div class="chip">AI</div>
                <h3>Hybrid AI & Infrastructure Lab</h3>
                <p class="project-stack">
                  <i class="tiny">cloud</i>Docker Compose<span class="sep"
                    >•</span
                  ><i class="tiny">language</i>Traefik<span class="sep">•</span
                  ><i class="tiny">vpn</i>WireGuard
                </p>
                <ul class="project-highlights">
                  <li>
                    Multi-node AI inference system with Docker Compose and
                    Traefik reverse proxy
                  </li>
                  <li>
                    Secure routing between public VPS services and private
                    Ollama via WireGuard
                  </li>
                  <li>
                    Tool-augmented local inference with Open-WebUI + external
                    search APIs
                  </li>
                  <li>
                    Custom LLM-powered Neovim workflow (CopilotChat + LiteLLM)
                  </li>
                </ul>
              </article>
              <article class="project-card">
                <div class="chip dev">Dev</div>
                <h3>Declarative Development Sandbox</h3>
                <p class="project-stack">
                  <i class="tiny">code</i>NixOS<span class="sep">•</span><i
                    class="tiny">inventory_2</i
                  >Podman
                </p>
                <ul class="project-highlights">
                  <li>
                    Reproducible dev environment using Nix Flakes with NVIDIA
                    drivers & GPU-accelerated Android emulators
                  </li>
                  <li>
                    Portable container orchestration with Podman-compose across
                    NixOS and macOS
                  </li>
                </ul>
              </article>
            </div>
          {:else if section.content === "certs"}
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
          {:else if section.content === "footer"}
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
  .masonry-layout {
    min-height: 100vh;
    background: var(--bg-primary);
    padding: 1.5rem;
    padding-top: 5rem;
  }

  .masonry-grid {
    column-count: var(--cols, 3);
    column-gap: 12px;
  }

  .masonry-item {
    break-inside: avoid;
    margin-bottom: 12px;
  }

  .masonry-item[data-height="small"] {
    min-height: 180px;
  }

  .masonry-item[data-height="medium"] {
    min-height: 350px;
  }

  .masonry-item[data-height="large"] {
    min-height: 450px;
  }

  .masonry-item[data-height="xlarge"] {
    min-height: 550px;
  }

  .masonry-cell {
    height: 100%;
    min-height: inherit;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    transition:
      border-color 0.2s,
      transform 0.2s;
  }

  .masonry-cell:hover {
    border-color: var(--accent);
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
    margin-bottom: 1.5rem;
    flex-shrink: 0;
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
    margin: 0;
  }

  .avatar {
    width: 120px;
    height: 120px;
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
    gap: 2rem;
    align-items: flex-start;
  }

  .header-text {
    display: flex;
    flex-direction: column;
  }

  .status-line {
    font-family: "Space Mono", monospace;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .prompt {
    color: var(--accent);
  }

  .status {
    color: #22c55e;
  }

  .name {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    line-height: 1.2;
  }

  .tagline {
    font-size: 1.25rem;
    color: var(--accent);
    font-weight: 500;
    margin: 0 0 1rem 0;
  }

  .command-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: "Space Mono", monospace;
    font-size: 0.85rem;
    padding: 0.5rem 0.75rem;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    color: var(--text-primary);
    text-decoration: none;
    width: fit-content;
    margin-bottom: 0.75rem;
  }

  .command-line:hover {
    border-color: var(--accent);
  }

  .command-line .prompt {
    font-weight: 700;
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

  .terminal-cell {
    padding: 0;
    min-height: 280px;
  }

  .terminal-cell :global(.terminal) {
    height: 100%;
  }

  .terminal-cell :global(.terminal-window) {
    height: 100%;
    border-radius: 12px;
  }

  .about-cell {
    gap: 0.5rem;
  }

  .about-text {
    font-size: 1.1rem;
    color: var(--text-secondary);
    line-height: 1.8;
    margin: 0 0 1.5rem 0;
    flex: 1;
  }

  .highlight {
    color: var(--accent);
    font-weight: 500;
  }

  .stats {
    display: flex;
    gap: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
  }

  .stat {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent);
    line-height: 1;
  }

  .stat-label {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .skills-cell {
    overflow: auto;
  }

  .skills-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    flex: 1;
  }

  .skill-category {
    padding: 1.25rem;
    background: var(--bg-tertiary);
    border-radius: 12px;
    transition:
      transform 0.2s,
      border-color 0.2s;
  }

  .skill-category:hover {
    transform: translateY(-2px);
    border-color: var(--accent);
  }

  .skill-icon {
    width: 36px;
    height: 36px;
    background: rgba(34, 211, 238, 0.1);
    border-radius: 10px;
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
  }

  .skill-category h4 {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.75rem 0;
  }

  .skill-category ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .skill-category li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
    padding: 0.25rem 0;
  }

  .skill-dot {
    width: 6px;
    height: 6px;
    background: var(--accent);
    border-radius: 50%;
  }

  .experience-cell {
    overflow: auto;
  }

  .timeline {
    flex: 1;
    overflow: auto;
  }

  .timeline-item {
    display: flex;
    gap: 1.25rem;
    margin-bottom: 1.5rem;
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
    width: 16px;
    height: 16px;
    background: var(--accent);
    border-radius: 50%;
    box-shadow:
      0 0 0 4px var(--bg-primary),
      0 0 0 5px var(--accent);
  }

  .marker-line {
    width: 2px;
    flex: 1;
    background: linear-gradient(180deg, var(--accent), var(--border));
    margin-top: 0.5rem;
  }

  .timeline-content {
    flex: 1;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.25rem;
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
    margin: 0 0 0.75rem 0;
  }

  .job-highlights {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .job-highlights li {
    padding: 0.35rem 0;
    padding-left: 1rem;
    position: relative;
  }

  .job-highlights li::before {
    content: "▹";
    position: absolute;
    left: 0;
    color: var(--accent);
  }

  .projects-cell {
    overflow: auto;
  }

  .project-card {
    position: relative;
    padding: 1.5rem;
    background: var(--bg-tertiary);
    border-radius: 12px;
    margin-bottom: 1rem;
  }

  .project-card:last-child {
    margin-bottom: 0;
  }

  .project-card .chip {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.25rem 0.75rem;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    background: var(--accent);
    color: var(--bg-primary);
    border-radius: 6px;
  }

  .project-card .chip.dev {
    background: #8b5cf6;
  }

  .project-card h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
    padding-right: 4rem;
  }

  .project-stack {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--text-muted);
    margin: 0 0 1rem 0;
    font-family: "Space Mono", monospace;
  }

  .sep {
    color: var(--border);
  }

  .project-highlights {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .project-highlights li {
    padding: 0.35rem 0;
    padding-left: 1rem;
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

  .certs-cell .certs-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .cert-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    font-size: 0.95rem;
    color: var(--text-primary);
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 10px;
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
    font-size: 1.25rem;
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
    font-size: 0.8rem;
    color: var(--text-muted);
    margin: 0.5rem 0 0 0;
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

  @media (max-width: 900px) {
    .masonry-layout {
      padding: 0.5rem;
      padding-top: 4.5rem;
    }

    .masonry-grid {
      column-count: 1;
    }

    .masonry-item {
      margin-bottom: 0.5rem;
    }
  }
</style>

