@default:
    just --list

# Protocol Buffer generation
generate:
    just generate-go
    just generate-ts

# Generate all protobuf clients/stubs (Go + TypeScript)

# Generate Go protobuf and gRPC code from all proto/*.proto files
generate-go:
    # Strip leading './' from find output so protoc gets clean relative paths
    cd proto && proto_files=$(find . -type f -name '*.proto' | sort | sed 's#^\./##') && test -n "$proto_files" && protoc --go_out=../backend --go-grpc_out=../backend $proto_files

# Generate TypeScript protobuf code using buf (buf.yaml + buf.gen.yaml)
generate-ts:
    buf generate

# Backend commands
# Download Go module dependencies
backend-deps:
    cd backend && go mod download

# Build backend server binary
backend-build:
    cd backend && go build -o bin/server ./cmd/server

# Run backend server locally
backend-run:
    cd backend && go run ./cmd/server

# Run backend test suite
backend-test:
    cd backend && go test ./...

# Run backend tests with coverage
backend-test-cover:
    cd backend && go test -cover ./...

# Frontend commands
# Install frontend dependencies
frontend-deps:
    cd frontend && bun install

# Start frontend development server
frontend-dev:
    cd frontend && bun run dev

# Build frontend for production
frontend-build:
    cd frontend && bun run build

# Run Svelte/TypeScript checks
frontend-check:
    cd frontend && bun run check

# Run Biome lint checks
frontend-lint:
    cd frontend && bun run lint

# Format frontend code with Biome
frontend-format:
    cd frontend && bun run format

# Check frontend formatting (no writes)
frontend-format-check:
    cd frontend && bun run format:check

# Run frontend unit/component tests
frontend-test:
    cd frontend && bun run test

# Run frontend Playwright end-to-end tests
frontend-test-e2e:
    cd frontend && bun run test:e2e

# Run frontend unit/component + e2e tests
frontend-test-all:
    just frontend-test
    just frontend-test-e2e

# Consolidated test commands
# Run default fast suite (backend + frontend unit tests)
test:
    just backend-test
    just frontend-test

# Run full suite (backend + frontend unit + frontend e2e)
test-all:
    just backend-test
    just frontend-test
    just frontend-test-e2e

# Clean
# Remove generated RPC artifacts
clean:
    rm -rf backend/internal/rpc/*
    rm -rf frontend/src/lib/gen/*

# Install tools
# Install Go protobuf codegen plugins
install-tools:
    go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Consolidated install
# Install tools + backend/frontend deps
install: install-tools backend-deps frontend-deps
    echo "Everything's installed"