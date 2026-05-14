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