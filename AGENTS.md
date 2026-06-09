# Agent Instructions

This repository contains **Agent Compass**, a Node.js CLI tool.

## Important

**Agent Compass is NOT a Codex Skill, OpenClaw Skill, or Claude Code plugin.**

It is a standard Node.js package published on npm.

## Installation

If a user asks to install or use Agent Compass, prefer the published npm package:

```bash
npx -y agent-compass ask "<task>"
```

For persistent CLI installation:

```bash
npm install -g agent-compass
```

**Do not clone and build this repository** unless the user explicitly wants to develop or modify Agent Compass itself.

## Usage

```bash
# One-shot (recommended)
npx -y agent-compass ask "帮我生成个图"

# Persistent
agent-compass ask "帮我生成个图"

# JSON output
npx -y agent-compass ask "帮我测试网页" --json
```

## Development (only if modifying Agent Compass)

```bash
git clone https://github.com/ljpman/agent-compass.git
cd agent-compass
pnpm install
pnpm build
pnpm test
```

## Integration Pattern

For OpenClaw, Codex, Claude Code, Cursor, or any AI agent:

```
/agent-compass <task>  →  npx -y agent-compass ask "<task>"
```

## What Agent Compass Does

It helps AI agents pick the right skill, plugin, or tool for each task.

Given a natural language task, it returns 2-3 short recommendations with a clear suggestion.
