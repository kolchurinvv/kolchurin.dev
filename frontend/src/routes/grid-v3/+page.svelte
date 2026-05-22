<script lang="ts">
  import Terminal from "$lib/components/Terminal.svelte";
  import { contact, experience, projects, skills } from "$lib/profile";

  interface GridSlot {
    col: number;
    row: number;
    colSpan: number;
    rowSpan: number;
  }

  interface Section {
    id: string;
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

  const focusSlots: GridSlot[] = [
    { col: 4, row: 2, colSpan: 6, rowSpan: 3 },
    { col: 1, row: 1, colSpan: 3, rowSpan: 3 },
    { col: 10, row: 1, colSpan: 3, rowSpan: 3 },
    { col: 1, row: 4, colSpan: 3, rowSpan: 3 },
    { col: 10, row: 4, colSpan: 3, rowSpan: 3 },
    { col: 4, row: 1, colSpan: 6, rowSpan: 1 },
    { col: 4, row: 5, colSpan: 6, rowSpan: 1 },
    { col: 4, row: 6, colSpan: 6, rowSpan: 1 },
  ];

  const sections: Section[] = [
    { id: "experience", priority: 10, content: "experience" },
    { id: "skills", priority: 9, content: "skills" },
    { id: "about", priority: 7, content: "about" },
    { id: "terminal", priority: 6, content: "terminal" },
    { id: "projects", priority: 5, content: "projects" },
    { id: "header", priority: 4, content: "header" },
    { id: "certs", priority: 2, content: "certs" },
    { id: "footer", priority: 1, content: "footer" },
  ];

  function getPrioritizedSections(): Array<Section & { slot: GridSlot }> {
    return [...sections]
      .sort((a, b) => b.priority - a.priority)
      .map((section, index) => ({ section, slot: focusSlots[index] }))
      .map(({ section, slot }) => ({ ...section, slot }));
  }

  function slotStyle(slot: GridSlot): string {
    return `grid-column: ${slot.col} / span ${slot.colSpan}; grid-row: ${slot.row} / span ${slot.rowSpan};`;
  }
</script>

<div class="focus-layout">
  <div class="focus-grid">
    {#each getPrioritizedSections() as section}
      <section class="focus-card" data-priority={section.priority} style={slotStyle(section.slot)}>
        {#if section.content === "header"}
          <div class="header-box">
            <img src="/headshot.webp" alt="Vladimir Kolchurin" class="avatar" />
            <div>
              <h2>Vladimir Kolchurin</h2>
              <p>Backend & Systems Engineer</p>
              <a href="mailto:{contact.email}">{contact.email}</a>
            </div>
          </div>
        {:else if section.content === "terminal"}
          <Terminal />
        {:else if section.content === "about"}
          <div>
            <h3>About</h3>
            <p>
              I specialize in resilient backend architectures, distributed data pipelines, and
              declarative development environments.
            </p>
          </div>
        {:else if section.content === "skills"}
          <div>
            <h3>Technical Skills</h3>
            <ul>
              {#each skills as skill}
                <li>{skill.category}</li>
              {/each}
            </ul>
          </div>
        {:else if section.content === "experience"}
          <div>
            <h3>Experience</h3>
            <ul>
              {#each experience.slice(0, 3) as job}
                <li><strong>{job.company}:</strong> {job.title}</li>
              {/each}
            </ul>
          </div>
        {:else if section.content === "projects"}
          <div>
            <h3>Projects</h3>
            <ul>
              {#each projects as project}
                <li>{project.name}</li>
              {/each}
            </ul>
          </div>
        {:else if section.content === "certs"}
          <div>
            <h3>Certifications</h3>
            <p>Ekahau ECSE Design, Cisco Meraki ECMS1</p>
          </div>
        {:else}
          <div class="footer-box">© {new Date().getFullYear()} Vladimir Kolchurin</div>
        {/if}
      </section>
    {/each}
  </div>
</div>

<style>
  .focus-layout {
    min-height: 100vh;
    padding: 1rem;
    padding-top: 5rem;
    background: var(--bg-primary);
  }

  .focus-grid {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-template-rows: repeat(6, minmax(90px, auto));
    gap: 0.75rem;
  }

  .focus-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1rem;
    overflow: auto;
  }

  .focus-card[data-priority="10"],
  .focus-card[data-priority="9"] {
    border-color: var(--accent);
  }

  .header-box {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .avatar {
    width: 72px;
    height: 72px;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid var(--border);
  }

  h2,
  h3 {
    margin: 0 0 0.5rem;
  }

  p,
  li,
  a {
    color: var(--text-secondary);
    margin: 0;
  }

  ul {
    margin: 0;
    padding-left: 1rem;
  }

  .footer-box {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
  }

  @media (max-width: 1280px) {
    .focus-grid {
      grid-template-columns: repeat(6, minmax(0, 1fr));
      grid-template-rows: auto;
    }

    .focus-card {
      grid-column: auto / span 3 !important;
      grid-row: auto !important;
      min-height: 200px;
    }

    .focus-card[data-priority="10"] {
      grid-column: auto / span 6 !important;
    }
  }

  @media (max-width: 900px) {
    .focus-layout {
      padding: 0.75rem;
      padding-top: 4.5rem;
    }

    .focus-grid {
      grid-template-columns: 1fr;
    }

    .focus-card {
      grid-column: auto !important;
      min-height: auto;
    }
  }
</style>
