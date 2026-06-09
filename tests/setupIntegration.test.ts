import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolve } from "node:path";
import { existsSync, readFileSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { setupIntegration } from "../src/setup/setupIntegration.js";

const TEST_DIR = resolve(import.meta.dirname, "..", ".test-setup");
const FAKE_HOME = resolve(TEST_DIR, "fake-home");

function setup(): void {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
  mkdirSync(TEST_DIR, { recursive: true });
  mkdirSync(FAKE_HOME, { recursive: true });
  process.chdir(TEST_DIR);
}

function cleanup(): void {
  process.chdir(resolve(import.meta.dirname, ".."));
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
}

function readFile(path: string): string {
  return readFileSync(resolve(TEST_DIR, path), "utf-8");
}

function readHomeFile(path: string): string {
  return readFileSync(resolve(FAKE_HOME, path), "utf-8");
}

function fileExists(path: string): boolean {
  return existsSync(resolve(TEST_DIR, path));
}

function homeFileExists(path: string): boolean {
  return existsSync(resolve(FAKE_HOME, path));
}

describe("setup adapters", () => {
  beforeEach(setup);
  afterEach(cleanup);

  // ── Codex (project-level) ───────────────────────────────────────

  it("setup codex creates AGENTS.md", () => {
    setupIntegration("codex");
    expect(fileExists("AGENTS.md")).toBe(true);
    const content = readFile("AGENTS.md");
    expect(content).toContain("npx -y agent-compass ask");
    expect(content).toContain("/agent-compass");
  });

  it("setup codex is idempotent", () => {
    setupIntegration("codex");
    setupIntegration("codex");
    const content = readFile("AGENTS.md");
    const matches = content.match(/<!-- agent-compass:start -->/g);
    expect(matches?.length).toBe(1);
  });

  it("setup codex does not overwrite existing AGENTS.md", () => {
    writeFileSync(resolve(TEST_DIR, "AGENTS.md"), "# Existing content\n\nKeep this.\n");
    setupIntegration("codex");
    const content = readFile("AGENTS.md");
    expect(content).toContain("# Existing content");
    expect(content).toContain("npx -y agent-compass ask");
  });

  it("setup codex skips if AGENTS.md already has npx instructions", () => {
    writeFileSync(resolve(TEST_DIR, "AGENTS.md"), "# Existing\n\nUse: npx -y agent-compass ask \"task\"\n");
    setupIntegration("codex");
    const content = readFile("AGENTS.md");
    // Should NOT append a second section
    const matches = content.match(/<!-- agent-compass:start -->/g);
    expect(matches).toBeNull();
  });

  it("setup codex --force overwrites existing section", () => {
    setupIntegration("codex");
    const content1 = readFile("AGENTS.md");
    expect(content1).toContain("Do not clone");
    // Modify the section marker area
    setupIntegration("codex", { force: true });
    const content2 = readFile("AGENTS.md");
    const matches = content2.match(/<!-- agent-compass:start -->/g);
    expect(matches?.length).toBe(1);
  });

  // ── Claude ──────────────────────────────────────────────────────

  it("setup claude creates .claude/commands/agent-compass.md", () => {
    setupIntegration("claude");
    expect(fileExists(".claude/commands/agent-compass.md")).toBe(true);
    const content = readFile(".claude/commands/agent-compass.md");
    expect(content).toContain("$ARGUMENTS");
    expect(content).toContain("npx -y agent-compass ask");
  });

  it("setup claude is idempotent for CLAUDE.md", () => {
    setupIntegration("claude");
    setupIntegration("claude");
    const content = readFile("CLAUDE.md");
    const matches = content.match(/<!-- agent-compass:start -->/g);
    expect(matches?.length).toBe(1);
  });

  it("setup claude --force overwrites .claude/commands", () => {
    setupIntegration("claude");
    setupIntegration("claude", { force: true });
    expect(fileExists(".claude/commands/agent-compass.md")).toBe(true);
    const content = readFile(".claude/commands/agent-compass.md");
    expect(content).toContain("$ARGUMENTS");
  });

  // ── OpenClaw (user-level: ~/.openclaw/) ──────────────────────────

  it("setup openclaw writes SKILL.md to ~/.openclaw/workspace/skills/", () => {
    setupIntegration("openclaw", { homeOverride: FAKE_HOME });
    expect(homeFileExists(".openclaw/workspace/skills/agent-compass/SKILL.md")).toBe(true);
    const content = readHomeFile(".openclaw/workspace/skills/agent-compass/SKILL.md");
    expect(content).toContain("agent-compass");
    expect(content).toContain("npx -y agent-compass ask");
    expect(content).toContain("name: agent-compass");
  });

  it("setup openclaw is idempotent", () => {
    setupIntegration("openclaw", { homeOverride: FAKE_HOME });
    const content1 = readHomeFile(".openclaw/workspace/skills/agent-compass/SKILL.md");
    setupIntegration("openclaw", { homeOverride: FAKE_HOME });
    const content2 = readHomeFile(".openclaw/workspace/skills/agent-compass/SKILL.md");
    expect(content1).toBe(content2);
  });

  it("setup openclaw --force overwrites SKILL.md", () => {
    setupIntegration("openclaw", { homeOverride: FAKE_HOME });
    setupIntegration("openclaw", { homeOverride: FAKE_HOME, force: true });
    expect(homeFileExists(".openclaw/workspace/skills/agent-compass/SKILL.md")).toBe(true);
    const content = readHomeFile(".openclaw/workspace/skills/agent-compass/SKILL.md");
    expect(content).toContain("npx -y agent-compass ask");
  });

  // ── Cursor ──────────────────────────────────────────────────────

  it("setup cursor creates .cursor/rules/agent-compass.md", () => {
    setupIntegration("cursor");
    expect(fileExists(".cursor/rules/agent-compass.md")).toBe(true);
    const content = readFile(".cursor/rules/agent-compass.md");
    expect(content).toContain("npx -y agent-compass ask");
  });

  it("setup cursor --force overwrites existing file", () => {
    setupIntegration("cursor");
    setupIntegration("cursor", { force: true });
    expect(fileExists(".cursor/rules/agent-compass.md")).toBe(true);
  });

  // ── Codex Skill (user-level: ~/.codex/) ──────────────────────────

  it("setup codex-skill generates SKILL.md", () => {
    setupIntegration("codex-skill", { homeOverride: FAKE_HOME });
    expect(homeFileExists(".codex/skills/agent-compass/SKILL.md")).toBe(true);
    const content = readHomeFile(".codex/skills/agent-compass/SKILL.md");
    expect(content).toContain("name: agent-compass");
    expect(content).toContain("description:");
  });

  it("setup codex-skill SKILL.md contains npx command", () => {
    setupIntegration("codex-skill", { homeOverride: FAKE_HOME });
    const content = readHomeFile(".codex/skills/agent-compass/SKILL.md");
    expect(content).toContain("npx -y agent-compass ask");
  });

  it("setup codex-skill is idempotent (skips without --force)", () => {
    setupIntegration("codex-skill", { homeOverride: FAKE_HOME });
    const content1 = readHomeFile(".codex/skills/agent-compass/SKILL.md");
    setupIntegration("codex-skill", { homeOverride: FAKE_HOME });
    const content2 = readHomeFile(".codex/skills/agent-compass/SKILL.md");
    expect(content1).toBe(content2);
  });

  it("setup codex-skill --force overwrites existing files", () => {
    setupIntegration("codex-skill", { homeOverride: FAKE_HOME });
    setupIntegration("codex-skill", { homeOverride: FAKE_HOME, force: true });
    expect(homeFileExists(".codex/skills/agent-compass/SKILL.md")).toBe(true);
    const content = readHomeFile(".codex/skills/agent-compass/SKILL.md");
    expect(content).toContain("npx -y agent-compass ask");
  });

  it("setup codex-skill generates openai.yaml", () => {
    setupIntegration("codex-skill", { homeOverride: FAKE_HOME });
    expect(homeFileExists(".codex/skills/agent-compass/agents/openai.yaml")).toBe(true);
    const content = readHomeFile(".codex/skills/agent-compass/agents/openai.yaml");
    expect(content).toContain("display_name: Agent Compass");
  });

  it("setup codex-skill SKILL.md description is under 120 chars", () => {
    setupIntegration("codex-skill", { homeOverride: FAKE_HOME });
    const content = readHomeFile(".codex/skills/agent-compass/SKILL.md");
    const descMatch = content.match(/description:\s*(.+)/);
    expect(descMatch).not.toBeNull();
    expect(descMatch![1].length).toBeLessThanOrEqual(120);
  });

  // ── dry-run ─────────────────────────────────────────────────────

  it("setup codex-skill --dry-run does not write files", () => {
    setupIntegration("codex-skill", { homeOverride: FAKE_HOME, dryRun: true });
    expect(homeFileExists(".codex/skills/agent-compass/SKILL.md")).toBe(false);
  });

  it("setup openclaw --dry-run does not write files", () => {
    setupIntegration("openclaw", { homeOverride: FAKE_HOME, dryRun: true });
    expect(homeFileExists(".openclaw/workspace/skills/agent-compass/SKILL.md")).toBe(false);
  });

  // ── setup all ───────────────────────────────────────────────────

  it("setup all creates all adapter files", () => {
    setupIntegration("all", { homeOverride: FAKE_HOME });
    expect(fileExists("AGENTS.md")).toBe(true);
    expect(homeFileExists(".codex/skills/agent-compass/SKILL.md")).toBe(true);
    expect(homeFileExists(".openclaw/workspace/skills/agent-compass/SKILL.md")).toBe(true);
    expect(fileExists(".claude/commands/agent-compass.md")).toBe(true);
    expect(fileExists(".cursor/rules/agent-compass.md")).toBe(true);
  });

  it("generated files contain npx -y agent-compass ask", () => {
    setupIntegration("all", { homeOverride: FAKE_HOME });
    // Project-level files
    for (const file of [
      "AGENTS.md",
      ".claude/commands/agent-compass.md",
      ".cursor/rules/agent-compass.md",
    ]) {
      const content = readFile(file);
      expect(content, `${file} should contain npx command`).toContain("npx -y agent-compass ask");
    }
    // User-level files
    for (const file of [
      ".codex/skills/agent-compass/SKILL.md",
      ".openclaw/workspace/skills/agent-compass/SKILL.md",
    ]) {
      const content = readHomeFile(file);
      expect(content, `${file} should contain npx command`).toContain("npx -y agent-compass ask");
    }
  });

  // ── validation ──────────────────────────────────────────────────

  it("setupIntegration rejects unknown agent names", () => {
    expect(() => setupIntegration("notepad")).toThrow();
  });

  // ── --force with content verification ───────────────────────────

  it("setup codex-skill --force actually replaces content", () => {
    setupIntegration("codex-skill", { homeOverride: FAKE_HOME });
    // Corrupt the file
    const skillMd = resolve(FAKE_HOME, ".codex", "skills", "agent-compass", "SKILL.md");
    writeFileSync(skillMd, "corrupted content", "utf-8");
    // Force overwrite
    setupIntegration("codex-skill", { homeOverride: FAKE_HOME, force: true });
    const content = readHomeFile(".codex/skills/agent-compass/SKILL.md");
    expect(content).toContain("npx -y agent-compass ask");
    expect(content).not.toContain("corrupted");
  });
});
