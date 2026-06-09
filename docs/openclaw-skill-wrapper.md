# OpenClaw Skill Wrapper

## How to install

Copy the `integrations/openclaw/agent-compass` directory to your OpenClaw skills directory:

```bash
cp -r integrations/openclaw/agent-compass ~/.openclaw/workspace/skills/agent-compass
```

Or symlink it:

```bash
ln -s $(pwd)/integrations/openclaw/agent-compass ~/.openclaw/workspace/skills/agent-compass
```

## How it works

The SKILL.md tells OpenClaw:

1. When the user says `/agent-compass <task>`, run `npx -y agent-compass ask "<task>"`
2. Use the output to recommend tools and continue the task

## Requirements

- Node.js >= 18
- npm (for npx)

## Notes

- This is a thin wrapper, not a full OpenClaw Skill.
- It delegates to the published npm package.
- No local build required.
