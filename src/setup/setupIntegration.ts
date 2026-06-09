import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const AGENTS_MD_CONTENT = `# Agent Instructions

This project uses [Agent Compass](https://github.com/ljpman/agent-compass) to pick the right tool for each task.

## Usage

\`\`\`
/agent-compass <task>
\`\`\`

This runs:

\`\`\`bash
npx -y agent-compass ask "<task>"
\`\`\`

## Examples

\`\`\`
/agent-compass 帮我生成个图
/agent-compass 帮我修一下登录页 500
/agent-compass 帮我分析这个 Excel
\`\`\`

## Notes

- Agent Compass is a Node.js CLI, not a skill/plugin.
- It returns 2-3 short recommendations with a clear suggestion.
- Reply naturally: "用第一个", "继续", "换一个"
`;

const CLAUDE_MD_CONTENT = `# Agent Compass Integration

This project uses Agent Compass for task-to-tool routing.

## Quick Usage

\`\`\`
/agent-compass <task description>
\`\`\`

## What it does

Given a natural language task, Agent Compass recommends the best skill, plugin, or tool.

## Examples

- \`/agent-compass 帮我生成个图\` → recommends image generation
- \`/agent-compass 帮我修 bug\` → recommends code editing
- \`/agent-compass 帮我做 PPT\` → recommends presentation tools
`;

const CLAUDE_COMMAND_CONTENT = `# Agent Compass

Use Agent Compass to find the right tool for a task.

Usage: /agent-compass <task>

Run: npx -y agent-compass ask "<task>"

Examples:
- /agent-compass 帮我生成个图
- /agent-compass 帮我修登录页 500
- /agent-compass 帮我分析 Excel
`;

const CURSOR_RULES_CONTENT = `# Agent Compass

This project uses Agent Compass for task-to-tool routing.

When the user says "/agent-compass <task>", run:

\`\`\`bash
npx -y agent-compass ask "<task>"
\`\`\`

Agent Compass returns 2-3 tool recommendations. Follow its suggestion.
`;

const OPENCLAW_SKILL_CONTENT = `---
name: agent-compass
description: "帮 AI Agent 为每个任务找到最合适的技能。"
---

# Agent Compass

使用 Agent Compass 为任务推荐最合适的工具。

## 使用方法

\`\`\`bash
npx -y agent-compass ask "<task>"
\`\`\`

## 示例

\`\`\`bash
npx -y agent-compass ask "帮我生成个图"
npx -y agent-compass ask "帮我修 bug"
\`\`\`

## 说明

- Agent Compass 是 Node.js CLI，不是 OpenClaw Skill
- 使用 npx 直接运行，无需克隆仓库
- 返回 2-3 个推荐选项，附带明确建议
`;

function writeFileIfNotExists(filePath: string, content: string): void {
  const fullPath = resolve(process.cwd(), filePath);
  if (existsSync(fullPath)) {
    console.log(`⏭️  ${filePath} 已存在，跳过`);
    return;
  }
  const dir = dirname(fullPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(fullPath, content, "utf-8");
  console.log(`✅ 已创建 ${filePath}`);
}

function appendToFile(filePath: string, content: string): void {
  const fullPath = resolve(process.cwd(), filePath);
  if (existsSync(fullPath)) {
    const existing = readFileSync(fullPath, "utf-8");
    if (existing.includes("agent-compass")) {
      console.log(`⏭️  ${filePath} 已包含 agent-compass，跳过`);
      return;
    }
    writeFileSync(fullPath, existing + "\n\n" + content, "utf-8");
    console.log(`✅ 已更新 ${filePath}`);
  } else {
    writeFileSync(fullPath, content, "utf-8");
    console.log(`✅ 已创建 ${filePath}`);
  }
}

export function setupIntegration(agent: string): void {
  console.log(`\n🔧 设置 ${agent} 集成...\n`);

  switch (agent) {
    case "codex":
      writeFileIfNotExists("AGENTS.md", AGENTS_MD_CONTENT);
      break;

    case "claude":
      appendToFile("CLAUDE.md", CLAUDE_MD_CONTENT);
      writeFileIfNotExists(".claude/commands/agent-compass.md", CLAUDE_COMMAND_CONTENT);
      break;

    case "openclaw":
      writeFileIfNotExists("integrations/openclaw/SKILL.md", OPENCLAW_SKILL_CONTENT);
      break;

    case "cursor":
      appendToFile(".cursorrules", CURSOR_RULES_CONTENT);
      break;

    case "all":
      writeFileIfNotExists("AGENTS.md", AGENTS_MD_CONTENT);
      appendToFile("CLAUDE.md", CLAUDE_MD_CONTENT);
      writeFileIfNotExists(".claude/commands/agent-compass.md", CLAUDE_COMMAND_CONTENT);
      writeFileIfNotExists("integrations/openclaw/SKILL.md", OPENCLAW_SKILL_CONTENT);
      appendToFile(".cursorrules", CURSOR_RULES_CONTENT);
      break;
  }

  console.log(`\n✅ ${agent} 集成设置完成\n`);
}
