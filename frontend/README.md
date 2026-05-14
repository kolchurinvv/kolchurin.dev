# frontend

SvelteKit frontend for **kolchurin.dev**.

This app renders the portfolio UI and includes unit/component tests (Vitest) and end-to-end tests (Playwright).

## Stack

- SvelteKit 2
- Svelte 5
- TypeScript
- Bun
- Biome (lint/format)
- Vitest + Testing Library
- Playwright

## Prerequisites

From repo root, install all dependencies with:

```bash
just install
```

Or install frontend deps only:

```bash
just frontend-deps
```

## Development

Run from repo root:

```bash
just frontend-dev
```

Default dev URL: `http://localhost:5173`

## Build

```bash
just frontend-build
```

## Quality checks

```bash
just frontend-check
just frontend-lint
just frontend-format
just frontend-format-check
```

## Tests

```bash
just frontend-test
just frontend-test-e2e
just frontend-test-all
```

## Scripts (direct Bun)

If you are already in `frontend/`:

```bash
bun run dev
bun run build
bun run check
bun run lint
bun run format
bun run format:check
bun run test
bun run test:e2e
```

## Project layout

```text
frontend/
├── src/
│   ├── lib/        # components, shared logic, profile data
│   ├── routes/     # SvelteKit routes
│   └── test/       # frontend test helpers
├── scripts/        # test runner helpers
├── tests/          # Playwright e2e specs
└── package.json
```

## Notes

- Generated protobuf TypeScript artifacts are produced from root via `just generate-ts`.
- Keep formatting and lint clean before opening PRs.
