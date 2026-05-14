# Delegate Agent

General-purpose agent for handling commits and PRs. Always fetches latest conventions before starting.

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

### 4. Branch Naming (STRICT)

**For conventional repos**: Prefix with `ai/`:
- `ai/feature/<description>`
- `ai/fix/<description>`
- `ai/chore/<description>`

**For worktree repos** (MUST detect first):
```bash
git worktree list | grep -q "$(pwd)" && echo "worktree" || echo "conventional"
```

If `worktree`:
- Use current worktree's branch only
- Branch name = worktree directory name
- NEVER use `git checkout -b` inside that worktree
- If new branch needed, create a NEW worktree from main:
  ```bash
  git worktree add ../<branch-name> -b <branch-name> main
  ```
- Do work in that new worktree directory
- Push that same branch to origin

### 5. Pull Request Rules (STRICT)

**Title**: Prefix with `ai: `
```
ai: feat(terminal): add route navigation
ai: fix: resolve memory leak
```

**Body**:
- Summary: 1-3 bullet points of changes
- Validation commands executed
- Watermark at end:
```
---
🤖 Watermark: ai-generated
Signed-off-by: AI Agent <ai+agent@kolchurin.dev>
```

**Creation command safety**:
- NEVER pass markdown body inline with `--body "..."` if it contains backticks
- ALWAYS use `--body-file`

Required pattern:
```bash
cat > /tmp/pr-body.md <<'EOF'
## Summary
- ...

## Validation
- `just frontend-test`
- `just frontend-test-e2e`

---
🤖 Watermark: ai-generated
Signed-off-by: AI Agent <ai+agent@kolchurin.dev>
EOF

gh pr create --base main --head <branch> \
  --title "ai: <type>: <summary>" \
  --body-file /tmp/pr-body.md
```

**Post-create verification**:
```bash
gh pr view <number> --json title,body,headRefName,baseRefName,url
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
- If PR title/body/labels are non-compliant, fix immediately
- If workflow was violated (wrong branch/worktree), close PR and recreate correctly

## Dependencies

- Uses `gh` CLI for PR creation
- Uses `git` for all version control
- Uses `just` for build/test commands