# kolchurin.dev

Personal website and backend playground for a frontend → backend transition.

## Stack

- **Frontend:** SvelteKit + TypeScript + Bun
- **Backend:** Go + gRPC
- **Data store:** Valkey (Redis-compatible)
- **Tooling:** Just, Buf, Protobuf, Biome, Vitest, Playwright, Nix Flakes

## Repository layout

```text
.
├── frontend/      # SvelteKit app (UI, tests, styles)
├── backend/       # Go gRPC server
├── proto/         # .proto contracts
├── deployment/    # Kubernetes/K3s manifests
├── docs/          # planning/notes
└── justfile       # main task runner
```

## Prerequisites

Recommended local tools:

- `just`
- `bun`
- `go`
- `protoc`
- `buf`
- `valkey`

If you use Nix, everything is provided by the project dev shell:

```bash
nix develop
```

## Quick start (local)

From repo root:

```bash
# Install codegen tools + backend/frontend deps
just install

# Generate protobuf stubs (Go + TypeScript)
just generate
```

Start Valkey (if you do not already have one running):

```bash
docker run --rm -p 6379:6379 valkey/valkey:latest
```

Run backend and frontend in separate terminals:

```bash
just backend-run
just frontend-dev
```

Default local endpoints:

- Frontend: `http://localhost:5173`
- Backend (gRPC): `localhost:8080`
- Valkey: `localhost:6379`

## Environment variables

| Variable | Default | Used by | Description |
|---|---|---|---|
| `VALKEY_ADDR` | `localhost:6379` | backend | Valkey server address |

## Common commands

### Frontend

```bash
just frontend-deps
just frontend-dev
just frontend-build
just frontend-check
just frontend-lint
just frontend-format
just frontend-format-check
just frontend-test
just frontend-test-e2e
```

### Backend

```bash
just backend-deps
just backend-run
just backend-build
just backend-test
just backend-test-cover
```

### Protobuf

```bash
just generate
just generate-go
just generate-ts
```

### Combined

```bash
just test       # backend + frontend unit
just test-all   # backend + frontend unit + frontend e2e
```

## Current status

- Frontend portfolio site is active and evolving.
- gRPC contract is defined in `proto/blog.proto`.
- Backend blog service methods are scaffolded and ready for implementation.

## Deployment

Kubernetes/K3s manifests and instructions live in:

- `deployment/README.md`

## License

No license file has been added yet.
