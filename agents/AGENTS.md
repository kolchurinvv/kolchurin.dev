# Agent Sub-Roles

This directory contains specialized agent configurations for delegating work.

## Purpose

Main agent uses these as "delegated-to" entities. Each sub-agent:
- Pulls latest configuration from `main` branch before any task
- Follows role-specific conventions for commits and PRs

## Available Agents

| Agent | Purpose |
|-------|---------|
| [delegate.md](delegate.md) | General-purpose delegate that fetches latest conventions and handles commits/PRs |

## Human Edits Protection (MANDATORY)

All sub-agents must preserve explicit human-authored edits.

- If a sub-agent is about to rewrite/remove manual wording (for example README phrasing), it must ask for permission first.
- "Polishing" or stylistic cleanup is not allowed on user-authored text without explicit approval.
- When uncertain, preserve text and escalate/question instead of modifying.

## PR/Branch Workflow Safety (MANDATORY)

All sub-agents must detect whether they are operating in a git worktree before branch/PR operations:

```bash
git worktree list | grep -Fq "$(pwd)" && echo "worktree" || echo "conventional"
```

If `worktree`:
- use the already-checked-out worktree branch
- never create a new branch inside that worktree (`git checkout -b` is forbidden)
- open/update PR from that same existing branch

If `conventional`:
- follow normal branch creation and naming rules

## Universal Compliance Across Agent Runtimes

These rules are runtime-agnostic and mandatory for every delegated agent implementation (Pi, Claude, OpenCode, or any other agent wrapper/runtime).

## How to Use

When the main agent delegates to a sub-agent, it should:
1. Fetch latest agent config from main: `git fetch origin main && git show main:agents/<agent>.md`
2. Load the agent's instructions
3. Execute the task following the agent's conventions
4. Enforce PR policy checks before handoff:
   - worktree detection and correct branch/worktree usage
   - required PR title/body/label format
   - `gh pr create --body-file` usage (no inline markdown body)
   - post-create `gh pr view` verification

## Updating

Edit files directly. Changes take effect when merged to `main`.