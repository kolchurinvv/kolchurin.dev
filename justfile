@default:
    just --list
# Protocol Buffer generation
generate:
    just generate-go
    just generate-ts
generate-go:
    cd proto && protoc \
        --go_out=../backend \
        --go-grpc_out=../backend \
        blog.proto \
        guestbook/v1/guestbook.proto
generate-ts:
    buf generate
# Backend commands
backend-deps:
    cd backend && go mod download
backend-build:
    cd backend && go build -o bin/server ./cmd/server
backend-run:
    cd backend && go run ./cmd/server
backend-test:
    cd backend && go test ./...
# Frontend commands
frontend-deps:
    cd frontend && bun install
frontend-dev:
    cd frontend && bun run dev
frontend-build:
    cd frontend && bun run build
frontend-check:
    cd frontend && bun run check
# Clean
clean:
    rm -rf backend/internal/rpc/*
    rm -rf frontend/src/lib/gen/*
# Install tools
install-tools:
    go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
# Consolidated install
install: install-tools backend-deps frontend-deps
  echo "Everything's installed"

