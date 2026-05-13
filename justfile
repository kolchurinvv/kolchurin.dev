@default:
    just --list

# Protocol Buffer generation
generate: # Generate all protobuf clients/stubs (Go + TypeScript)
    just generate-go
    just generate-ts

generate-go: # Generate Go protobuf and gRPC code from all proto/*.proto files
    # Strip leading './' from find output so protoc gets clean relative paths
    cd proto && proto_files=$(find . -type f -name '*.proto' | sort | sed 's#^\./##') && test -n "$proto_files" && protoc --go_out=../backend --go-grpc_out=../backend $proto_files

generate-ts: # Generate TypeScript protobuf code using buf (buf.yaml + buf.gen.yaml)
    buf generate

# Backend commands
backend-deps: # Download Go module dependencies
    cd backend && go mod download

backend-build: # Build backend server binary
    cd backend && go build -o bin/server ./cmd/server

backend-run: # Run backend server locally
    cd backend && go run ./cmd/server

backend-test: # Run backend test suite
    cd backend && go test ./...

backend-test-cover: # Run backend tests with coverage
    cd backend && go test -cover ./...

# Frontend commands
frontend-deps: # Install frontend dependencies
    cd frontend && bun install

frontend-dev: # Start frontend development server
    cd frontend && bun run dev

frontend-build: # Build frontend for production
    cd frontend && bun run build

frontend-check: # Run Svelte/TypeScript checks
    cd frontend && bun run check

frontend-lint: # Run Biome lint checks
    cd frontend && bun run lint

frontend-format: # Format frontend code with Biome
    cd frontend && bun run format

frontend-format-check: # Check frontend formatting (no writes)
    cd frontend && bun run format:check

frontend-test: # Run frontend unit/component tests
    cd frontend && bun run test

frontend-test-e2e: # Run frontend Playwright end-to-end tests
    cd frontend && bun run test:e2e

frontend-test-all: # Run frontend unit/component + e2e tests
    just frontend-test
    just frontend-test-e2e

# Consolidated test commands
test: # Run default fast suite (backend + frontend unit tests)
    just backend-test
    just frontend-test

test-all: # Run full suite (backend + frontend unit + frontend e2e)
    just backend-test
    just frontend-test
    just frontend-test-e2e

# Clean
clean: # Remove generated RPC artifacts
    rm -rf backend/internal/rpc/*
    rm -rf frontend/src/lib/gen/*

# Install tools
install-tools: # Install Go protobuf codegen plugins
    go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Consolidated install
install: install-tools backend-deps frontend-deps # Install tools + backend/frontend deps
    echo "Everything's installed"
