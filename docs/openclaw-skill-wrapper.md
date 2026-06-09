# OpenClaw Skill Wrapper

## How to install

```bash
npx -y agent-compass setup openclaw
```

This writes `~/.openclaw/workspace/skills/agent-compass/SKILL.md` directly.

## Verify

After setup, OpenClaw should discover the skill automatically. If not, restart OpenClaw.

## How it works

The SKILL.md tells OpenClaw:

1. When the user says `/agent-compass <task>`, run `npx -y agent-compass ask "<task>"`
2. Use the output to recommend tools and continue the task

## Overwrite existing

```bash
npx -y agent-compass setup openclaw --force
```

## Preview (no write)

```bash
npx -y agent-compass setup openclaw --dry-run
```

## Uninstall

```bash
rm -rf ~/.openclaw/workspace/skills/agent-compass
```

## Requirements

- Node.js >= 18
- npm (for npx)

## Notes

- This is a thin wrapper, not a full OpenClaw Skill.
- It delegates to the published npm package.
- No local build required.
- `setup openclaw` is idempotent — safe to run multiple times.
