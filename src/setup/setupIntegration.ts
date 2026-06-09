import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { homedir } from "node:os";

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

// ── Codex Skill adapter ────────────────────────────────────────────
const CODEX_SKILL_MD = `---
name: agent-compass
description: Helps Codex pick the right skill, plugin, MCP server, CLI tool, repo script, or workflow for a task.
---

# Agent Compass

Use this skill when the user asks which Skill, plugin, MCP server, CLI tool, repo script, or workflow should be used for a task.

Also use this skill when the user starts with:

/agent-compass <task>

## Behavior

1. Treat the text after \`/agent-compass\` as the task.
2. Run Agent Compass through the npm CLI:

\`\`\`bash
npx -y agent-compass ask "<task>"
\`\`\`

3. Show the result to the user.
4. Keep the response short and conversational.
5. If the user chooses an option, continue with that option when possible.
6. If installation or risky execution is needed, ask for confirmation first.

## Important

Agent Compass is a Node.js CLI wrapped as a Codex Skill.

Do not clone the Agent Compass repository unless the user explicitly wants to develop Agent Compass itself.

Do not use skill-installer to install Agent Compass from GitHub as if the entire repo were a Codex Skill.

Use the published npm package:

\`\`\`bash
npx -y agent-compass ask "<task>"
\`\`\`
`;

const CODEX_OPENAI_YAML = `interface:
  display_name: Agent Compass
  short_description: Find the right skill, plugin, or tool for each task.
  icon: compass
  color: blue
`;

// ── Helper functions ───────────────────────────────────────────────

function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write a file with optional --force support.
 * Without force: skip if exists.
 * With force: overwrite.
 */
function writeFileWithForce(filePath: string, content: string, force?: boolean): void {
  const fullPath = resolve(process.cwd(), filePath);
  if (existsSync(fullPath) && !force) {
    console.log(`⏭️  ${filePath} 已存在，使用 --force 覆盖`);
    return;
  }
  ensureDir(dirname(fullPath));
  writeFileSync(fullPath, content, "utf-8");
  console.log(`✅ ${force && existsSync(fullPath) ? "已覆盖" : "已创建"} ${filePath}`);
}

/**
 * Write a file to an absolute path (for user-level installs like ~/.codex/).
 * With optional --force support.
 */
function writeAbsoluteFileWithForce(filePath: string, content: string, force?: boolean): void {
  if (existsSync(filePath) && !force) {
    console.log(`⏭️  ${filePath} 已存在，使用 --force 覆盖`);
    return;
  }
  ensureDir(dirname(filePath));
  writeFileSync(filePath, content, "utf-8");
  console.log(`✅ ${force && existsSync(filePath) ? "已覆盖" : "已写入"} ${filePath}`);
}

/**
 * Append a marked section to a file, idempotently.
 * If the section already exists (by marker), skip.
 * If force: replace existing section.
 */
function appendSection(filePath: string, section: string, force?: boolean): void {
  const fullPath = resolve(process.cwd(), filePath);

  if (existsSync(fullPath)) {
    const existing = readFileSync(fullPath, "utf-8");

    if (existing.includes(SECTION_MARKER)) {
      if (force) {
        // Replace existing section
        const regex = new RegExp(
          `${SECTION_MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${SECTION_MARKER_END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
          "m"
        );
        const updated = existing.replace(regex, section);
        writeFileSync(fullPath, updated, "utf-8");
        console.log(`✅ 已覆盖 ${filePath} 中的 Agent Compass section`);
      } else {
        console.log(`⏭️  ${filePath} 已包含 Agent Compass section，跳过`);
      }
      return;
    }

    // Check if file already has npx instructions (avoid duplication in AGENTS.md)
    if (existing.includes("npx -y agent-compass ask")) {
      if (!force) {
        console.log(`⏭️  ${filePath} 已包含 agent-compass 指令，跳过`);
        return;
      }
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

function setupCodex(force?: boolean): void {
  appendSection("AGENTS.md", CODEX_SECTION, force);
}

function setupCodexSkill(options: SetupOptions = {}): void {
  const home = options.homeOverride ?? homedir();
  const skillDir = resolve(home, ".codex", "skills", "agent-compass");
  const skillMd = resolve(skillDir, "SKILL.md");
  const openaiYaml = resolve(skillDir, "agents", "openai.yaml");

  if (options.dryRun) {
    console.log(`[试运行] 将写入:`);
    console.log(`  ${skillMd}`);
    console.log(`  ${openaiYaml}`);
    return;
  }

  // Create directory
  if (!existsSync(skillDir)) {
    mkdirSync(skillDir, { recursive: true });
    console.log(`✅ 已创建目录 ${skillDir}`);
  }

  // Write SKILL.md
  writeAbsoluteFileWithForce(skillMd, CODEX_SKILL_MD, options.force);

  // Write openai.yaml
  const agentsDir = resolve(skillDir, "agents");
  if (!existsSync(agentsDir)) {
    mkdirSync(agentsDir, { recursive: true });
  }
  writeAbsoluteFileWithForce(openaiYaml, CODEX_OPENAI_YAML, options.force);
}

function setupClaude(force?: boolean): void {
  writeFileWithForce(".claude/commands/agent-compass.md", CLAUDE_COMMAND_CONTENT, force);
  appendSection("CLAUDE.md", CLAUDE_MD_SECTION, force);
}

function setupOpenClaw(options: SetupOptions = {}): void {
  const home = options.homeOverride ?? homedir();
  const skillDir = resolve(home, ".openclaw", "workspace", "skills", "agent-compass");
  const skillMd = resolve(skillDir, "SKILL.md");

  if (options.dryRun) {
    console.log(`[试运行] 将写入:`);
    console.log(`  ${skillMd}`);
    return;
  }

  // Create directory
  if (!existsSync(skillDir)) {
    mkdirSync(skillDir, { recursive: true });
    console.log(`✅ 已创建目录 ${skillDir}`);
  }

  // Write SKILL.md
  writeAbsoluteFileWithForce(skillMd, OPENCLAW_SKILL_CONTENT, options.force);
}

function setupCursor(force?: boolean): void {
  writeFileWithForce(".cursor/rules/agent-compass.md", CURSOR_RULES_CONTENT, force);
}

// ── Valid agents ───────────────────────────────────────────────────

export const VALID_AGENTS = ["codex", "codex-skill", "claude", "openclaw", "cursor", "all"] as const;
export type AgentName = (typeof VALID_AGENTS)[number];

// ── Main entry ─────────────────────────────────────────────────────

export interface SetupOptions {
  force?: boolean;
  dryRun?: boolean;
  homeOverride?: string; // for testing: override homedir()
}

export function setupIntegration(agent: string, options: SetupOptions = {}): void {
  if (!VALID_AGENTS.includes(agent as AgentName)) {
    console.log(`❌ 未知 agent: ${agent}`);
    console.log(`支持: ${VALID_AGENTS.join(", ")}`);
    process.exit(1);
  }

  console.log(`\n🔧 设置 ${agent} 集成...\n`);

  switch (agent) {
    case "codex":
      setupCodex(options.force);
      break;
    case "codex-skill":
      setupCodexSkill(options);
      break;
    case "claude":
      setupClaude(options.force);
      break;
    case "openclaw":
      setupOpenClaw(options);
      break;
    case "cursor":
      setupCursor(options.force);
      break;
    case "all":
      setupCodex(options.force);
      setupCodexSkill(options);
      setupClaude(options.force);
      setupOpenClaw(options);
      setupCursor(options.force);
      break;
  }

  console.log(`\n✅ ${agent} 集成设置完成\n`);
}
