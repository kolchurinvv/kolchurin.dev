# kolchurin.dev

[![CI](https://github.com/kolchurinvv/kolchurin.dev/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/kolchurinvv/kolchurin.dev/actions/workflows/ci.yml)
![Frontend Coverage](docs/badges/frontend-coverage.svg)
![Backend Coverage](docs/badges/backend-coverage.svg)

Personal website and playground by (and for - aka me) a full-stack engineer increasingly focused on self-hosted solutions, privacy, and security.

> Coverage badges are self-managed. Regenerate from tests with:
> - `just badges-update`

## Tech Stack
- **Frontend**: SvelteKit (TypeScript, Bun)
- **Backend**: Go with gRPC
- **Database**: Valkey (Redis-compatible)

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
| --- | --- | --- | --- |
| `VALKEY_ADDR` | `localhost:6379` | `backend` | Valkey server address |
