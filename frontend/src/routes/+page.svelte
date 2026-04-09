<script lang="ts">
const contact = {
  phone: "+420 605 376 615",
  email: "vladimir@kolchurin.dev",
  github: "github.com/kolchurinvv",
};

const skills = [
  {
    category: "Backend & Databases",
    items: ["Go", "Node.js/Deno/Bun", "MongoDB/Mongoose", "PostgreSQL"],
  },
  {
    category: "Cloud & DevOps",
    items: ["Kubernetes", "NixOS (Flakes)", "Podman/Docker", "GCP", "AWS Lambda"],
  },
  {
    category: "Networking & Systems",
    items: ["WireGuard", "Linux SysAdmin", "NGINX", "Traefik", "Cisco Meraki"],
  },
  {
    category: "AI Infrastructure",
    items: ["LiteLLM", "Ollama", "Open-WebUI", "Private AI Deployments"],
  },
];

const experience = [
  {
    company: "Sticky Ventures",
    period: "September 2024 – Present",
    title: "Full-Stack Developer",
    highlights: [
      "Architected licensing & seat-management system protecting organizational revenue",
      "Built resilient local dev environments using Podman-compose with hot-reload",
      "Developed RPE/Wellness reporting engine with MongoDB aggregations and auto-generated CSV/XLSX exports",
      "Created data sync pipelines with Go, handling deduplication and protected-field logic",
    ],
  },
  {
    company: "Cometa Group",
    period: "October 2021 – September 2024",
    title: "Full-Stack Developer",
    highlights: [
      "Led massive tech debt reduction: Webpack 3→5, Node 8→16, Firebase SDK 5→9",
      "Architected modular component system reducing regression rates significantly",
      "Designed Firebase→Firestore migration path with normalized data structures",
      "Built biometric data ingestion pipeline with GCP Cloud Scheduler & Tasks",
      "Implemented multi-tier subscription engine with Stripe integration",
    ],
  },
  {
    company: "Proxify AB",
    period: "July 2021 – February 2022",
    title: "Full-Stack Developer",
    highlights: [
      "Directed code quality for distributed team of 4 developers",
      "Managed high-availability VPS infrastructure for Nuxt.js, Strapi, and WordPress",
      "Performed root-cause analysis for service degradations linked to unoptimized ORM queries",
    ],
  },
  {
    company: "Logsie LLC",
    period: "March 2020 – January 2021",
    title: "Full-Stack Developer / Technical Lead",
    highlights: [
      "Scaled engineering organization by recruiting and assembling core team",
      "Defined product MVP and technology stack aligned with fundraising milestones",
    ],
  },
  {
    company: "ThomDigital Group",
    period: "August 2018 – March 2020",
    title: "IT Infrastructure Consultant",
    highlights: [
      "Deployed enterprise Cisco Meraki networking with API-driven automation",
      "Architected physical-to-digital security integrations across NYC office sites",
    ],
  },
];

let terminalVisible = $state(false);
</script>

<div class="bg-orbs">
	<div class="orb orb-1"></div>
	<div class="orb orb-2"></div>
	<div class="orb orb-3"></div>
</div>

<header class="header">
	<div class="container">
		<div class="header-grid">
			<div class="header-text">
				<div class="badge">
					<span class="badge-dot"></span>
					Available for projects
				</div>
				<h1>Vladimir Kolchurin</h1>
				<p class="tagline">Backend & Systems Engineer</p>
				<p class="focus">
					Building resilient architectures, distributed pipelines, and declarative environments
				</p>
				<div class="contact">
					<a href="mailto:{contact.email}" class="contact-link">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="2" y="4" width="20" height="16" rx="2"></rect>
							<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
						</svg>
						{contact.email}
					</a>
					<a href="https://{contact.github}" target="_blank" rel="noopener" class="contact-link">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
						</svg>
						{contact.github}
					</a>
					<a href="tel:{contact.phone.replace(/\s/g, "")}" class="contact-link">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
						</svg>
						{contact.phone}
					</a>
				</div>
			</div>
			<div class="terminal">
				<div class="terminal-header">
					<div class="terminal-dots">
						<span></span>
						<span></span>
						<span></span>
					</div>
					<span class="terminal-title">~/kolchurin.dev</span>
				</div>
				<div class="terminal-body">
					<div class="terminal-line">
						<span class="prompt">❯</span>
						<span class="command">whoami</span>
					</div>
					<div class="terminal-output">vladimir kolchurin</div>
					<div class="terminal-line">
						<span class="prompt">❯</span>
						<span class="command">cat skills.json</span>
					</div>
					<div class="terminal-output code-block">
						<pre>{`{
  "languages": ["Go", "Node.js", "Rust"],
  "cloud": ["GCP", "AWS", "K8s"],
  " databases": ["PostgreSQL", "MongoDB"],
  "devops": ["NixOS", "Docker", "CI/CD"]
}`}</pre>
					</div>
					<div class="terminal-line">
						<span class="prompt">❯</span>
						<span class="cursor">_</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</header>

<main>
	<section class="section">
		<div class="container">
			<div class="section-header">
				<span class="section-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
						<circle cx="12" cy="7" r="4"></circle>
					</svg>
				</span>
				<h2 class="section-title">About</h2>
			</div>
			<div class="about-card">
				<p class="about-text">
					I specialize in building <span class="highlight">resilient backend architectures</span>, distributed data
					pipelines, and declarative development environments. With a background in enterprise networking and a
					<span class="highlight">DevOps-first</span> mindset, I excel at solving complex synchronization and
					infrastructure challenges—moving beyond the UI to engineer robust, high-performance systems.
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
				<span class="section-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="16 18 22 12 16 6"></polyline>
						<polyline points="8 6 2 12 8 18"></polyline>
					</svg>
				</span>
				<h2 class="section-title">Technical Skills</h2>
			</div>
			<div class="skill-grid">
				{#each skills as skill, i}
					<div class="skill-category" style="--delay: {i * 0.1}s">
						<div class="skill-icon">
							{#if i === 0}
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
									<path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
									<path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
								</svg>
							{:else if i === 1}
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
								</svg>
							{:else if i === 2}
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
									<rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
									<line x1="6" y1="6" x2="6.01" y2="6"></line>
									<line x1="6" y1="18" x2="6.01" y2="18"></line>
								</svg>
							{:else}
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M12 2a4 4 0 0 1 4 4c0 .34-.04.67-.1 1A4 4 0 0 1 18 10c0 2.21-1.79 4-4 4a4 4 0 0 1-3.9-3c-.06-.33-.1-.66-.1-1A4 4 0 0 1 12 2z"></path>
									<path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
									<line x1="9" y1="9" x2="9.01" y2="9"></line>
									<line x1="15" y1="9" x2="15.01" y2="9"></line>
								</svg>
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
				<span class="section-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
						<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
					</svg>
				</span>
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
				<span class="section-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
					</svg>
				</span>
				<h2 class="section-title">Side Projects</h2>
			</div>
			<div class="project-grid">
				<article class="project-card">
					<div class="project-badge">AI</div>
					<h3>Hybrid AI & Infrastructure Lab</h3>
					<p class="project-stack">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
							<path d="M13.983 11.078h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.186v1.887c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 0 0 .186-.186V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.186m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 0 0 .184-.186V6.29a.185.185 0 0 0-.185-.185H8.1a.185.185 0 0 0-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 0 0 .185-.186V6.29a.186.186 0 0 0-.185-.185H5.136a.186.186 0 0 0-.186.185v1.887c0 .102.084.186.186.186m5.893 2.715h2.118a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.118a.185.185 0 0 0-.185.186v1.887c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.186v1.887c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.185-.186H5.136a.186.186 0 0 0-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.186.186 0 0 0-.185.186v1.887c0 .102.084.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 0 0-.75.748 11.376 11.376 0 0 0 .692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 0 0 3.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z"></path>
						</svg>
						Docker Compose
						<span class="separator">•</span>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="10"></circle>
							<line x1="2" y1="12" x2="22" y2="12"></line>
							<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
						</svg>
						Traefik
						<span class="separator">•</span>
						WireGuard
					</p>
					<ul class="project-highlights">
						<li>Multi-node AI inference system with Docker Compose and Traefik reverse proxy</li>
						<li>Secure routing between public VPS services and private Ollama via WireGuard</li>
						<li>Tool-augmented local inference with Open-WebUI + external search APIs</li>
						<li>Custom LLM-powered Neovim workflow (CopilotChat + LiteLLM)</li>
					</ul>
				</article>
				<article class="project-card">
					<div class="project-badge dev">Dev</div>
					<h3>Declarative Development Sandbox</h3>
					<p class="project-stack">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12.614 0L.29 5.309v13.382L12.614 24l12.326-5.309V5.309L12.614 0zm7.143 17.217l-2.201 1.21-2.199-1.21V5.783l2.199-1.21 2.201 1.21v11.434z"></path>
						</svg>
						NixOS
						<span class="separator">•</span>
						Podman
					</p>
					<ul class="project-highlights">
						<li>Reproducible dev environment using Nix Flakes with NVIDIA drivers & GPU-accelerated Android emulators</li>
						<li>Portable container orchestration with Podman-compose across NixOS and macOS</li>
					</ul>
				</article>
			</div>
		</div>
	</section>

	<section class="section">
		<div class="container">
			<div class="section-header">
				<span class="section-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="8" r="6"></circle>
						<path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
					</svg>
				</span>
				<h2 class="section-title">Certifications</h2>
			</div>
			<div class="cert-grid">
				<div class="cert-badge">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
						<polyline points="22 4 12 14.01 9 11.01"></polyline>
					</svg>
					Ekahau ECSE Design
				</div>
				<div class="cert-badge">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
						<polyline points="22 4 12 14.01 9 11.01"></polyline>
					</svg>
					Cisco Meraki ECMS1
				</div>
			</div>
		</div>
	</section>
</main>

<footer class="footer">
	<div class="container">
		<div class="footer-content">
			<div class="footer-logo">
				<span class="logo-bracket">&lt;</span>
				<span class="logo-text">VK</span>
				<span class="logo-bracket">/&gt;</span>
			</div>
			<p>&copy; {new Date().getFullYear()} Vladimir Kolchurin. Built with SvelteKit.</p>
		</div>
	</div>
</footer>

<style>
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

	.header-grid {
		position: relative;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: center;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background-color: rgba(34, 211, 238, 0.1);
		border: 1px solid var(--accent);
		border-radius: 9999px;
		font-size: 0.8rem;
		color: var(--accent);
		margin-bottom: 1.5rem;
	}

	.badge-dot {
		width: 8px;
		height: 8px;
		background-color: #22c55e;
		border-radius: 50%;
		animation: pulse 2s ease-in-out infinite;
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

	.focus {
		font-size: 1rem;
		color: var(--text-secondary);
		margin-bottom: 2rem;
		max-width: 450px;
	}

	.contact {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.contact-link {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		color: var(--text-secondary);
		font-size: 0.95rem;
		transition: color 0.2s;
	}

	.contact-link:hover {
		color: var(--accent);
	}

	.contact-link svg {
		color: var(--accent);
		flex-shrink: 0;
	}

	.terminal {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
		box-shadow:
			0 25px 50px -12px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(255, 255, 255, 0.05);
	}

	.terminal-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background-color: var(--bg-tertiary);
		border-bottom: 1px solid var(--border);
	}

	.terminal-dots {
		display: flex;
		gap: 0.5rem;
	}

	.terminal-dots span {
		width: 12px;
		height: 12px;
		border-radius: 50%;
	}

	.terminal-dots span:nth-child(1) {
		background-color: #ef4444;
	}
	.terminal-dots span:nth-child(2) {
		background-color: #eab308;
	}
	.terminal-dots span:nth-child(3) {
		background-color: #22c55e;
	}

	.terminal-title {
		font-size: 0.8rem;
		color: var(--text-muted);
		font-family: monospace;
	}

	.terminal-body {
		padding: 1.5rem;
		font-family: monospace;
		font-size: 0.9rem;
	}

	.terminal-line {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.prompt {
		color: var(--accent);
	}

	.command {
		color: var(--text-primary);
	}

	.terminal-output {
		color: var(--text-secondary);
		margin-bottom: 1rem;
		padding-left: 1.25rem;
	}

	.code-block {
		background-color: var(--bg-primary);
		border-radius: 8px;
		padding: 1rem;
		overflow-x: auto;
	}

	.code-block pre {
		margin: 0;
		color: var(--text-primary);
	}

	.cursor {
		display: inline-block;
		width: 10px;
		height: 1.2em;
		background-color: var(--accent);
		animation: blink 1s step-end infinite;
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

	.about-card {
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

	.skill-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
	}

	.skill-category {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 12px;
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
		box-shadow: 0 0 0 4px var(--bg-primary), 0 0 0 5px var(--accent);
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

	.project-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
	}

	.project-card {
		position: relative;
		background-color: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 2rem;
		transition:
			transform 0.2s,
			border-color 0.2s;
	}

	.project-card:hover {
		transform: translateY(-4px);
		border-color: var(--accent);
	}

	.project-badge {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		padding: 0.25rem 0.75rem;
		background-color: rgba(34, 211, 238, 0.1);
		border: 1px solid var(--accent);
		border-radius: 9999px;
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.project-badge.dev {
		background-color: rgba(139, 92, 246, 0.1);
		border-color: #8b5cf6;
		color: #8b5cf6;
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
		font-family: monospace;
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

	.cert-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.cert-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		background-color: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 12px;
		font-size: 1rem;
		color: var(--text-primary);
		transition: border-color 0.2s;
	}

	.cert-badge:hover {
		border-color: var(--accent);
	}

	.cert-badge svg {
		color: var(--accent);
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
		font-family: monospace;
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

	@media (max-width: 900px) {
		.header-grid {
			grid-template-columns: 1fr;
			gap: 3rem;
		}

		.skill-grid {
			grid-template-columns: 1fr;
		}

		.project-grid {
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
</style>
