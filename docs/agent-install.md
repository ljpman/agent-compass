# Agent Installation Guide

## For AI Coding Agents

**Agent Compass is a Node.js CLI, not a skill/plugin.** Use npm/npx to install and run.

### Recommended One-Shot Usage

```bash
npx -y agent-compass ask "<task>"
```

Examples:

```bash
npx -y agent-compass ask "帮我生成个图"
npx -y agent-compass ask "帮我规划一个 AI 工具网站"
npx -y agent-compass ask "帮我分析这个 Excel 哪个渠道转化最好"
```

### Persistent Installation

```bash
npm install -g agent-compass
agent-compass ask "<task>"
```

### JSON Output (Developer Mode)

```bash
npx -y agent-compass ask "<task>" --json
```

### Other Commands

```bash
npx -y agent-compass scan                    # Scan current repo
npx -y agent-compass validate-registry       # Validate registry
npx -y agent-compass inspect <id>            # View tool details
```

---

## Integration Pattern

For any AI agent system:

```
/agent-compass <task>  →  npx -y agent-compass ask "<task>"
```

---

## Development Install

Only if you want to modify Agent Compass itself:

```bash
git clone https://github.com/ljpman/agent-compass.git
cd agent-compass
pnpm install
pnpm build
pnpm test
```

---

## Common Mistakes

- ❌ Treating this as a Codex Skill and running skill-installer
- ❌ Treating this as an OpenClaw Skill and running `clawhub install`
- ❌ Cloning the repo just to use the CLI
- ❌ Running `pnpm build` when you only need to run the tool

✅ Just use `npx -y agent-compass ask "<task>"`
