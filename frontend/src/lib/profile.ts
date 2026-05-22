export const contact = {
  phone: "+420 605 376 615",
  email: "vladimir@kolchurin.dev",
  github: "github.com/kolchurinvv",
  linkedin: "www.linkedin.com/in/vladimir-kolchurin/",
}

export const skills = [
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
]

export const experience = [
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
]

export const about = `I specialize in building resilient backend architectures, distributed data
pipelines, and declarative development environments. With a background in
enterprise networking and a DevOps-first mindset, I excel at solving complex
synchronization and infrastructure challenges—moving beyond the UI to engineer robust, high-performance systems.`

export const projects = [
  {
    name: "Hybrid AI & Infrastructure Lab",
    tags: ["AI", "Docker Compose", "Traefik", "WireGuard"],
    highlights: [
      "Multi-node AI inference system with Docker Compose and Traefik reverse proxy",
      "Secure routing between public VPS services and private Ollama via WireGuard",
      "Tool-augmented local inference with Open-WebUI + external search APIs",
      "Custom LLM-powered Neovim workflow (CopilotChat + LiteLLM)",
    ],
  },
  {
    name: "Declarative Development Sandbox",
    tags: ["Dev", "NixOS", "Podman"],
    highlights: [
      "Reproducible dev environment using Nix Flakes with NVIDIA drivers & GPU-accelerated Android emulators",
      "Portable container orchestration with Podman-compose across NixOS and macOS",
    ],
  },
]

export const skillsJson = JSON.stringify(
  skills.reduce(
    (acc, s) => {
      acc[s.category.toLowerCase()] = s.items
      return acc
    },
    {} as Record<string, string[]>
  ),
  null,
  2
)

export const experienceJson = JSON.stringify(experience, null, 2)

export const contactText = `Email: ${contact.email}
Phone: ${contact.phone}
GitHub: ${contact.github}
LinkedIn: ${contact.linkedin}`

export const projectsJson = JSON.stringify(projects, null, 2)

export const aboutText = about
