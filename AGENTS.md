# Agent Guidelines for kolchurin.dev

Personal website project for a developer transitioning from frontend to backend, built with:
- **Frontend**: SvelteKit (TypeScript, Bun)
- **Backend**: Go with gRPC
- **Database**: Valkey (Redis-compatible)

## Project Structure

```
/
├── frontend/          # SvelteKit application
│   ├── src/
│   │   ├── lib/      # Shared utilities, components
│   │   ├── routes/   # SvelteKit pages
│   │   └── rpc/      # Generated gRPC clients
│   ├── biome.json    # Biome configuration
│   └── package.json
├── backend/           # Go gRPC server
│   ├── cmd/server/   # Main application entry
│   ├── internal/     # Private application code
│   │   ├── api/      # gRPC service implementations
│   │   ├── db/       # Valkey client and models
│   │   └── rpc/      # Generated protobuf stubs
│   └── go.mod
└── proto/             # Protocol Buffer definitions
```

---

## Build Commands

### Frontend (Bun)

```bash
cd frontend

# Install dependencies
bun install

# Development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Type checking
bun run check

# Biome lint + format
bun run lint      # Check linting
bun run format    # Format code
bun run format:check  # Check formatting without fixing
```

### Backend (Go)

```bash
cd backend

# Install dependencies
go mod download

# Generate protobuf code
make generate

# Run development server
make run

# Build binary
make build

# Run tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run single test
go test ./internal/api/... -run TestServiceName -v

# Lint
golangci-lint run

# Format code
go fmt ./...
```

### Protocol Buffers

```bash
# Generate all protobuf code (from project root)
make generate

# Generate specifically for Go
cd proto && protoc --go_out=../backend --go-grpc_out=../backend *.proto

# Generate specifically for TypeScript
cd proto && protoc --ts_out=../frontend/src/rpc *.proto
```

---

## Code Style Guidelines

### TypeScript / SvelteKit (Frontend)

**File Organization**
- One component per file, named with PascalCase: `BlogPost.svelte`
- Utilities and types in `src/lib/` with kebab-case or camelCase
- Use barrel exports (`index.ts`) for library public APIs

**Naming Conventions**
```
Components:     PascalCase (BlogCard.svelte)
Hooks:         camelCase (useAuth.ts)
Types/Classes:  PascalCase (UserProfile)
Constants:     SCREAMING_SNAKE_CASE
Files:         kebab-case (user-service.ts)
```

**Imports**
- Group imports: 1) Node built-ins, 2) External packages, 3) Internal modules
- Use absolute imports via `$lib/` for internal code
- Always use TypeScript types, never use `any`

**Types**
```typescript
// Prefer interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// Use type for unions/intersections
type ApiResponse<T> = { data: T; error: null } | { data: null; error: Error };

// Avoid enums, use const objects or union types
const Status = { Active: 'active', Inactive: 'inactive' } as const;
type Status = typeof Status[keyof typeof Status];
```

**Error Handling**
- Use Result pattern or try/catch with typed errors
- Never swallow errors silently
- Return meaningful error messages to clients

### Go (Backend)

**File Organization**
- One package per directory, package name matches directory
- Use `internal/` for private packages (Go convention)
- Keep `cmd/` for application entry points only

**Naming Conventions**
```
Packages:       lowercase, no underscores (api, db, rpc)
Functions:      PascalCase for exported, camelCase for unexported
Interfaces:     PascalCase, often "-er" suffix (Reader, Writer)
Constants:      PascalCase for exported, camelCase for unexported
Files:          snake_case.go
```

**Imports**
- Group imports: 1) Standard library, 2) External packages, 3) Internal packages
- Use `goimports` to manage imports automatically

**Error Handling**
```go
// Wrap errors with context
if err != nil {
    return fmt.Errorf("failed to fetch user %d: %w", id, err)
}

// Return early on errors, avoid else branches
if err != nil {
    return nil, err
}
// continue normal flow

// Custom error types for API responses
type NotFoundError struct {
    Resource string
    ID       string
}

func (e *NotFoundError) Error() string {
    return fmt.Sprintf("%s not found: %s", e.Resource, e.ID)
}
```

**Context Usage**
- Pass `context.Context` as first parameter to all server functions
- Use `context.WithTimeout` for operations that need deadlines
- Check `ctx.Err()` in long-running operations

### Protocol Buffers

**Service Definition**
```protobuf
service BlogService {
  rpc GetPost(GetPostRequest) returns (Post);
  rpc ListPosts(ListPostsRequest) returns (ListPostsResponse);
  rpc CreatePost(CreatePostRequest) returns (Post);
}
```

**Naming**
- Messages: PascalCase
- Fields: snake_case
- RPC methods: PascalCase verb + Noun pattern (GetUser, ListPosts)
- Use singular names for message types (not UserList, use Users or ListUsers response)

**Field Types**
- Use `string` for text, `bytes` for binary data
- Use `int64` for timestamps (Unix epoch) or `google.protobuf.Timestamp`
- Use `bool` for flags, never use `int` or `string` as boolean
- Repeated fields for collections, not `List` suffixes

---

## Testing

### Frontend
```bash
bun run test          # Run all tests
bun run test:watch    # Watch mode
bun test src/lib/utils.test.ts -w  # Single file watch mode
```

### Backend
```bash
go test ./...              # All tests
go test -v ./internal/api/...  # Verbose output
go test -run ^TestName$ ./...  # Run specific test by name
go test -cover ./...       # With coverage report
```

### Test Naming
```
Test<Unit>_<Scenario>_<ExpectedBehavior>
TestUserService_GetByID_ReturnsUser
TestBlogController_CreatePost_Unauthorized
```

---

## Biome Configuration

Biome is configured via `frontend/biome.json`. Default rules:
- Max line width: 100
- Indent: 2 spaces
- Semicolons: required
- Quote style: double quotes

Run `bun run format` before committing. CI enforces formatting checks.

Biome v2 configuration uses `assist` section for organize imports:
```json
{
  "assist": {
    "actions": {
      "source": { "recommended": true }
    }
  }
}
```

---

## gRPC Communication

**Frontend → Backend**
- Frontend uses generated TypeScript gRPC client
- All RPC calls return Promises
- Handle connection errors gracefully with retry logic
- Use environment variables for server address

**Error Mapping**
- gRPC status codes map to frontend error types
- `NOT_FOUND` → 404 user-facing error
- `UNAUTHENTICATED` → redirect to login
- `INTERNAL` → generic error message, log details server-side

---

## Git Conventions

**Branch Naming**
```
feature/add-blog-posts
bugfix/fix-navigation-menu
chore/update-dependencies
```

**Commit Messages** (Conventional Commits)
```
feat: add blog post listing
fix: resolve memory leak in gRPC client
docs: update README with new commands
refactor: extract user validation to separate module
```
