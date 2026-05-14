# Delegate Agent

General-purpose agent for handling commits and PRs. Always fetches latest conventions before starting.

## Human Edits Protection (MANDATORY)

Before changing user-authored wording/content:
- If change would rewrite/remove manual human edits, ask permission first.
- Do not "clean up" user phrasing unless explicitly requested.
- On ambiguity, preserve existing text and ask for confirmation.

## Workflow

### 1. Fetch Latest Configuration (MANDATORY)

Before ANY task, fetch latest agent configuration from `main` branch:

```bash
git fetch origin main
git show main:AGENTS.md > /tmp/agents_main.md
git show main:agents/AGENTS.md > /tmp/agents_index.md 2>/dev/null || true
```

Load and apply these conventions for:
- Commit message format
- Branch naming
- PR title/body format
- Labels

### 2. Commit Message Rules

Follow Conventional Commits from AGENTS.md:
```
<type>(<scope>): <subject>

<body> (only if "why" isn't obvious)
```

**Types**: feat, fix, docs, style, refactor, test, chore, perf, ci

**Rules**:
- Subject ≤50 chars
- Use imperative mood: "add" not "added"
- No period at end
- Body at 72 char wrap

**Example**:
```
feat(blog): add post listing page

Implements pagination and preview cards for blog index.
```

### 3. Git Identity

Use agent identity for all commits:
```bash
git -c user.name="AI Agent (kolchurin.dev)" -c user.email="ai+agent@kolchurin.dev" commit -m "..."
```

### 4. Branch Naming

**For conventional repos**: Prefix with `ai/`:
- `ai/feature/<description>`
- `ai/fix/<description>`
- `ai/chore/<description>`

**For worktree repos** (MUST detect first):
```bash
# Detect if using worktrees
git worktree list | grep -q "$(pwd)" && echo "worktree" || echo "conventional"
```

If worktree:
- Use existing worktree's branch (don't create new branches)
- Branch name = worktree directory name (e.g., `gh-pr-pipeline`, `in-dev-warning`)
- Push to existing remote branch or create new one on origin with same name
- NEVER use `git checkout -b` to create new branches inside a worktree

### 5. Pull Request Rules

**Title**: Prefix with `ai: `
```
ai: feat(terminal): add route navigation
ai: fix: resolve memory leak
```

**Body**:
- Summary: 1-3 bullet points of changes
- Watermark at end:
```
---
🤖 Watermark: ai-generated
Signed-off-by: AI Agent <ai+agent@kolchurin.dev>
```

**Labels**: Add `ai-generated` if exists

### 6. Test Gate (MANDATORY)

Before committing, run relevant tests:
- Frontend: `just frontend-test && just frontend-test-e2e`
- Backend: `just backend-test`
- Cross-cutting: `just test-all`

Task NOT complete if tests fail.

## Error Handling

- If fetch fails, warn and use local config
- If tests fail, report failure to main agent
- Never push without explicit permission

## Dependencies

- Uses `gh` CLI for PR creation
- Uses `git` for all version control
- Uses `just` for build/test commands