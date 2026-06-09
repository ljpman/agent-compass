import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

// ── Section marker for idempotent append ───────────────────────────
const SECTION_MARKER = "<!-- agent-compass:start -->";
const SECTION_MARKER_END = "<!-- agent-compass:end -->";

// ── Codex adapter ──────────────────────────────────────────────────
const CODEX_SECTION = `${SECTION_MARKER}
# Agent Compass

When the user starts a message with \`/agent-compass\`, treat the rest of the message as the task.

Run:

\`\`\`bash
npx -y agent-compass ask "<task after /agent-compass>"
\`\`\`

Examples:

- \`/agent-compass 帮我生成个图\`
- \`/agent-compass 帮我修登录页 500\`
- \`/agent-compass 帮我规划一个 AI 工具网站\`

Do not clone the Agent Compass repository unless the user explicitly wants to develop Agent Compass itself.
Do not treat Agent Compass as a Codex Skill. It is a Node.js CLI.
${SECTION_MARKER_END}`;

// ── Claude Code adapter ────────────────────────────────────────────
const CLAUDE_COMMAND_CONTENT = `# Agent Compass

Pick the right skill, plugin, or tool for the user's task.

## Usage

\`\`\`
/agent-compass <task>
\`\`\`

## Command

\`\`\`bash
npx -y agent-compass ask "$ARGUMENTS"
\`\`\`

## Examples

- \`/agent-compass 帮我生成个图\`
- \`/agent-compass 帮我修登录页 500\`
- \`/agent-compass 帮我规划一个 AI 工具网站\`

## Notes

- Agent Compass is a Node.js CLI, not a Claude Code plugin.
- It returns 2-3 short recommendations with a clear suggestion.
- Do not clone/build the repo unless developing Agent Compass.
`;

const CLAUDE_MD_SECTION = `${SECTION_MARKER}
## Agent Compass

When the user uses \`/agent-compass <task>\`, call:

\`\`\`bash
npx -y agent-compass ask "<task>"
\`\`\`

Do not clone/build the repo unless developing Agent Compass.
${SECTION_MARKER_END}`;

// ── OpenClaw adapter ───────────────────────────────────────────────
const OPENCLAW_SKILL_CONTENT = `---
name: agent-compass
description: "Use when the user says /agent-compass or asks which Skill, plugin, MCP server, CLI tool, repo script, or workflow is best for a task. Agent Compass helps AI agents pick the right skill or tool for each task."
---

# Agent Compass

When the user says:

\`\`\`
/agent-compass <task>
\`\`\`

Run:

\`\`\`bash
npx -y agent-compass ask "<task>"
\`\`\`

Use the output to recommend 2-3 choices and continue the user's task.

## Examples

- \`/agent-compass 帮我生成个图\` → recommends image generation
- \`/agent-compass 帮我修登录页 500\` → recommends code editing
- \`/agent-compass 帮我规划一个 AI 工具网站\` → recommends product planning

## Important

- Agent Compass is a Node.js CLI.
- Do not clone this repository unless the user wants to develop it.
- Do not install unknown packages.
- Use the published npm package via npx.
`;

const OPENCLAW_WRAPPER_DOC = `# OpenClaw Skill Wrapper

## How to install

Copy the \`integrations/openclaw/agent-compass\` directory to your OpenClaw skills directory:

\`\`\`bash
cp -r integrations/openclaw/agent-compass ~/.openclaw/workspace/skills/agent-compass
\`\`\`

Or symlink it:

\`\`\`bash
ln -s $(pwd)/integrations/openclaw/agent-compass ~/.openclaw/workspace/skills/agent-compass
\`\`\`

## How it works

The SKILL.md tells OpenClaw:

1. When the user says \`/agent-compass <task>\`, run \`npx -y agent-compass ask "<task>"\`
2. Use the output to recommend tools and continue the task

## Requirements

- Node.js >= 18
- npm (for npx)

## Notes

- This is a thin wrapper, not a full OpenClaw Skill.
- It delegates to the published npm package.
- No local build required.
`;

// ── Cursor adapter ─────────────────────────────────────────────────
const CURSOR_RULES_CONTENT = `# Agent Compass

When the user types \`/agent-compass <task>\`, run:

\`\`\`bash
npx -y agent-compass ask "<task>"
\`\`\`

Use the result to suggest the best skill, plugin, MCP server, CLI tool, repo script, or workflow.

## Examples

- \`/agent-compass 帮我生成个图\` → recommends image generation
- \`/agent-compass 帮我修登录页 500\` → recommends code editing
- \`/agent-compass 帮我规划一个 AI 工具网站\` → recommends product planning

## Notes

- Agent Compass is a Node.js CLI, not a Cursor extension.
- Do not clone/build Agent Compass unless developing it.
- Returns 2-3 short recommendations with a clear suggestion.
`;

// ── Helper functions ───────────────────────────────────────────────

function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function writeFile(filePath: string, content: string): void {
  const fullPath = resolve(process.cwd(), filePath);
  ensureDir(dirname(fullPath));
  writeFileSync(fullPath, content, "utf-8");
  console.log(`✅ 已创建 ${filePath}`);
}

function writeFileIfNotExists(filePath: string, content: string): void {
  const fullPath = resolve(process.cwd(), filePath);
  if (existsSync(fullPath)) {
    console.log(`⏭️  ${filePath} 已存在，跳过`);
    return;
  }
  ensureDir(dirname(fullPath));
  writeFileSync(fullPath, content, "utf-8");
  console.log(`✅ 已创建 ${filePath}`);
}

/**
 * Append a marked section to a file, idempotently.
 * If the section already exists (by marker), skip.
 */
function appendSection(filePath: string, section: string): void {
  const fullPath = resolve(process.cwd(), filePath);

  if (existsSync(fullPath)) {
    const existing = readFileSync(fullPath, "utf-8");
    if (existing.includes(SECTION_MARKER)) {
      console.log(`⏭️  ${filePath} 已包含 Agent Compass section，跳过`);
      return;
    }
    // Append with spacing
    const separator = existing.endsWith("\n") ? "" : "\n";
    writeFileSync(fullPath, existing + separator + "\n" + section + "\n", "utf-8");
    console.log(`✅ 已更新 ${filePath}`);
  } else {
    writeFileSync(fullPath, section + "\n", "utf-8");
    console.log(`✅ 已创建 ${filePath}`);
  }
}

// ── Adapter functions ──────────────────────────────────────────────

function setupCodex(): void {
  appendSection("AGENTS.md", CODEX_SECTION);
}

function setupClaude(): void {
  writeFileIfNotExists(".claude/commands/agent-compass.md", CLAUDE_COMMAND_CONTENT);
  appendSection("CLAUDE.md", CLAUDE_MD_SECTION);
}

function setupOpenClaw(): void {
  writeFileIfNotExists("integrations/openclaw/agent-compass/SKILL.md", OPENCLAW_SKILL_CONTENT);
  writeFileIfNotExists("docs/openclaw-skill-wrapper.md", OPENCLAW_WRAPPER_DOC);
}

function setupCursor(): void {
  writeFileIfNotExists(".cursor/rules/agent-compass.md", CURSOR_RULES_CONTENT);
}

// ── Main entry ─────────────────────────────────────────────────────

export function setupIntegration(agent: string): void {
  console.log(`\n🔧 设置 ${agent} 集成...\n`);

  switch (agent) {
    case "codex":
      setupCodex();
      break;
    case "claude":
      setupClaude();
      break;
    case "openclaw":
      setupOpenClaw();
      break;
    case "cursor":
      setupCursor();
      break;
    case "all":
      setupCodex();
      setupClaude();
      setupOpenClaw();
      setupCursor();
      break;
    default:
      console.log(`❌ 未知 agent: ${agent}`);
      console.log(`支持: codex, claude, openclaw, cursor, all`);
      process.exit(1);
  }

  console.log(`\n✅ ${agent} 集成设置完成\n`);
}
