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

## Project Structure
- `frontend/`: SvelteKit application
- `backend/`: Go gRPC server
- `proto/`: Protocol Buffer definitions
