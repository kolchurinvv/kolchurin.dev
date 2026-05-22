# CLAUDE.md

Project-wide conventions, build/test commands, code-style rules, testing gates, gRPC patterns, human-edit protection, git/PR workflow, and AI-agent identity rules live in **`AGENTS.md`** at the repo root. Read it before doing any non-trivial work — its rules apply to Claude Code without exception, including the strict AI-PR title prefix, branch naming, and watermark conventions.

This file adds only what's specific to Claude Code or worth surfacing on top of AGENTS.md.

## Stack at a glance

SvelteKit + TypeScript + Bun (frontend), Go + gRPC (backend), Valkey for storage, Protocol Buffers via Buf, `just` as the task runner. A `nix develop` shell provides all of it — `just --list` shows the available recipes.

## Worktree mode (important)

The repo uses a bare + sibling-worktrees layout. Every working copy under `~/Dev_Projects/kolchurin.dev/` — including `main/` — is a worktree, not a conventional checkout. Other worktrees live alongside it (one per feature branch).

Detect at the start of a session:

```bash
git worktree list | grep -Fq "$(pwd)" && echo "worktree" || echo "conventional"
```

In worktree mode (the default here), AGENTS.md is strict: **do not** create new branches inside an existing worktree with `git checkout -b`. Use the branch already attached to the current worktree. To start a new branch, add a new worktree from `main` instead:

```bash
git worktree add ../<branch-name> -b <branch-name> main
```

## Sub-agents and delegation

Specialised agent roles live under `agents/`:

- `agents/AGENTS.md` — index of sub-agents.
- `agents/delegate.md` — delegate-agent workflow; sub-agents fetch the latest config from `main` before acting.

Prefer Claude Code's own subagent types (Explore, Plan, general-purpose) for in-session work; the `agents/` directory is for cross-tool conventions when other harnesses operate on the repo.

## What's in `docs/`

`docs/` holds planning notes and personal artifacts, not site content:

- `GUESTBOOK_PLAN.md` — guestbook feature plan.
- `where.md` — design notes.
- `todo-developer_story.md` — spec for an in-progress developer-memoir document.
- `developer_story.md` — the deliverable being written interview-style (mixed third/first-person voice; "Vovych" is the user's self-styled name).
- `_developer-story-session.md` — handoff scratch for the in-progress memoir interview. Read it if a session resumes the interview. Delete when the memoir is finished.
- `badges/` — self-managed coverage badges; regenerate with `just badges-update`.

## Reminders specific to this repo

- **Commits/pushes only on explicit request.** Switch to the agent git identity (`AI Agent (kolchurin.dev)` / `ai+agent@kolchurin.dev`) before any commit — AGENTS.md has the exact incantation.
- **PRs created by Claude must satisfy all five AGENTS.md rules**: `ai:` title prefix, `ai/` branch prefix (in conventional mode), watermark + signed-off-by in the body, `ai-generated` label if it exists, `--body-file` (never inline `--body` with backticks).
- **Treat human-authored doc/README prose as authoritative.** Ask before rewriting or "cleaning up" wording the user wrote themselves.
- **Tests gate handoff.** Frontend changes → `just frontend-test` and `just frontend-test-e2e`. Backend changes → `just backend-test`. Cross-cutting → `just test-all`. Don't claim a task is complete with a failing relevant suite.
