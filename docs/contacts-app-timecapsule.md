# contacts-app — time-capsule follow-up

> Captured during the developer-story interview (see `docs/developer_story.md`, Chapter 3 — Cometa Group section). Pick this up later as its own task.

## The artifact

- **Repo:** [`kolchurinvv/contacts-app`](https://github.com/kolchurinvv/contacts-app)
- **Description:** Contacts list manager — coding-challenge build for Cometa Group, mid-2018.
- **Stack (per repo metadata):** Vue + JavaScript backend, JWT auth, Sequelize ORM, Pug + SASS templates.
- **Window:** init commit 29 May 2018 → "first build for client" 29 Jun 2018 (~1 month, built in the evenings/early mornings around a Sheepshead Bay construction day-job).
- **Why it matters:** this is the artifact that marks the crossover point — Vladimir's first paid dev contract in NYC. The path was Williamsburg housemate Bobby → his former boss Mike (Cometa Group) → this assignment → hourly contract.

## What Vladimir wants

1. **Link to the original repo from kolchurin.dev** — surface it as part of the personal-history / portfolio narrative on the site.
2. **Run it as a time capsule.** Bring the existing 2018 code back to life inside a Docker container, *without* modernising the dependencies. Keep it disingenuous-free: same Node version, same package-lock if there is one, same MySQL/Sequelize layer it shipped with. The goal is "this is what 2018 me built, exactly as it was" — not "this is what 2024 me would polish it into."
3. **Do not auto-update deps.** If it won't run cleanly as-is, prefer pinning the runtime (older Node, older MySQL) over bumping the app's deps.

## Open questions to resolve when picking this up

- Does `package.json` lock a Node version? If not, infer from commit dates (Node 8/10 era) and pin in the Dockerfile.
- DB target: `Sequelize` connector — check `config/` for whether it's MySQL or Postgres. Stand up a matching DB container.
- Seed script (`introduced npm seed script`, commit 28 Jun 2018) — wire it into the compose so the demo has content.
- CORS / Axios issue mentioned in commit log — may need a same-origin docker-network setup to avoid breakage.
- How / where to surface the live demo from `kolchurin.dev` — link out to a public URL or embed an iframe? (Probably link-out is safer for a 2018 app.)

## Status

- [ ] Clone repo, attempt local boot with pinned Node + DB.
- [ ] Wrap working state in `docker-compose.yml` (app + DB + seed).
- [ ] Decide hosting target (small VPS, alongside other self-hosted services, per Vladimir's hosting philosophy).
- [ ] Add a "Time-capsule projects" link from `kolchurin.dev` → repo + live demo.
