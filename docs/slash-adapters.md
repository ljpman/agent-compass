# Slash Adapters

## Why

Agent Compass is a Node.js CLI via npm. But users in Codex, Claude Code, OpenClaw, or Cursor don't want to type `npx -y agent-compass ask "..."` every time.

Slash adapters let users type:

```
/agent-compass 帮我生成个图
```

And the AI agent translates that to:

```bash
npx -y agent-compass ask "帮我生成个图"
```

## Unified UX

Every adapter uses the same user-facing interface:

```
/agent-compass <task>
```

No matter which agent you're in, the experience is identical.

## Setup

```bash
# Configure all supported agents at once
npx -y agent-compass setup all

# Or configure one agent
npx -y agent-compass setup codex
npx -y agent-compass setup claude
npx -y agent-compass setup openclaw
npx -y agent-compass setup cursor
```

## How Each Agent Is Supported

### Codex

**File:** `AGENTS.md`

Codex reads `AGENTS.md` for project-level instructions. The adapter appends a section telling Codex:

- When the user says `/agent-compass <task>`, run `npx -y agent-compass ask "<task>"`
- Do not clone the repo or treat it as a Codex Skill

Idempotent: running `setup codex` multiple times does not duplicate the section.

### Claude Code

**Files:** `.claude/commands/agent-compass.md` + `CLAUDE.md`

Claude Code supports custom slash commands via `.claude/commands/`. The adapter creates:

- `.claude/commands/agent-compass.md` — the slash command definition with `$ARGUMENTS`
- Updates `CLAUDE.md` with integration instructions

The user types `/agent-compass <task>` and Claude Code runs the command.

### OpenClaw

**File:** `~/.openclaw/workspace/skills/agent-compass/SKILL.md`

OpenClaw supports skills via `SKILL.md` files. The adapter writes directly to the user's OpenClaw skills directory:

- Triggers on `/agent-compass <task>`
- Runs `npx -y agent-compass ask "<task>"`
- Returns recommendations

No manual copy needed — `setup openclaw` writes to `~/.openclaw/workspace/skills/agent-compass/` directly.

### Cursor

**File:** `.cursor/rules/agent-compass.md`

Cursor reads `.cursor/rules/` for project rules. The adapter creates a rule file that tells Cursor to run `npx -y agent-compass ask "<task>"` when the user types `/agent-compass`.

## Recommended Call

All adapters call:

```bash
npx -y agent-compass ask "<task>"
```

This uses the published npm package. No clone, no build, no local install required.

## Safety

- All wrappers only call the published npm package via `npx`
- No unknown scripts are executed
- No local build is required for end users
- `setup` is idempotent — running it multiple times is safe
- Existing files are not overwritten
