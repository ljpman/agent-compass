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

  it("setup claude creates .claude/commands/agent-compass.md", () => {
    setupIntegration("claude");
    expect(fileExists(".claude/commands/agent-compass.md")).toBe(true);
    const content = readFile(".claude/commands/agent-compass.md");
    expect(content).toContain("$ARGUMENTS");
    expect(content).toContain("npx -y agent-compass ask");
  });

  it("setup openclaw creates integrations/openclaw/agent-compass/SKILL.md", () => {
    setupIntegration("openclaw");
    expect(fileExists("integrations/openclaw/agent-compass/SKILL.md")).toBe(true);
    const content = readFile("integrations/openclaw/agent-compass/SKILL.md");
    expect(content).toContain("agent-compass");
    expect(content).toContain("npx -y agent-compass ask");
    expect(content).toContain("name: agent-compass");
  });

  it("setup cursor creates .cursor/rules/agent-compass.md", () => {
    setupIntegration("cursor");
    expect(fileExists(".cursor/rules/agent-compass.md")).toBe(true);
    const content = readFile(".cursor/rules/agent-compass.md");
    expect(content).toContain("npx -y agent-compass ask");
  });

  it("setup all creates all adapter files", () => {
    setupIntegration("all", { homeOverride: FAKE_HOME });
    expect(fileExists("AGENTS.md")).toBe(true);
    expect(homeFileExists(".codex/skills/agent-compass/SKILL.md")).toBe(true);
    expect(fileExists(".claude/commands/agent-compass.md")).toBe(true);
    expect(fileExists("integrations/openclaw/agent-compass/SKILL.md")).toBe(true);
    expect(fileExists(".cursor/rules/agent-compass.md")).toBe(true);
  });

  it("generated files contain npx -y agent-compass ask", () => {
    setupIntegration("all", { homeOverride: FAKE_HOME });
    for (const file of [
      "AGENTS.md",
      ".claude/commands/agent-compass.md",
      "integrations/openclaw/agent-compass/SKILL.md",
      ".cursor/rules/agent-compass.md",
    ]) {
      const content = readFile(file);
      expect(content, `${file} should contain npx command`).toContain("npx -y agent-compass ask");
    }
  });

  it("setup claude is idempotent for CLAUDE.md", () => {
    setupIntegration("claude");
    setupIntegration("claude");
    const content = readFile("CLAUDE.md");
    const matches = content.match(/<!-- agent-compass:start -->/g);
    expect(matches?.length).toBe(1);
  });

  it("setup openclaw creates docs/openclaw-skill-wrapper.md", () => {
    setupIntegration("openclaw");
    expect(fileExists("docs/openclaw-skill-wrapper.md")).toBe(true);
    const content = readFile("docs/openclaw-skill-wrapper.md");
    expect(content).toContain("openclaw");
  });

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

  it("setup codex-skill is idempotent with --force", () => {
    setupIntegration("codex-skill", { homeOverride: FAKE_HOME });
    setupIntegration("codex-skill", { homeOverride: FAKE_HOME, force: true });
    expect(homeFileExists(".codex/skills/agent-compass/SKILL.md")).toBe(true);
  });

  it("setup codex-skill skips without --force if exists", () => {
    setupIntegration("codex-skill", { homeOverride: FAKE_HOME });
    const content1 = readHomeFile(".codex/skills/agent-compass/SKILL.md");
    setupIntegration("codex-skill", { homeOverride: FAKE_HOME });
    const content2 = readHomeFile(".codex/skills/agent-compass/SKILL.md");
    expect(content1).toBe(content2);
  });

  it("setup codex-skill generates openai.yaml", () => {
    setupIntegration("codex-skill", { homeOverride: FAKE_HOME });
    expect(homeFileExists(".codex/skills/agent-compass/agents/openai.yaml")).toBe(true);
    const content = readHomeFile(".codex/skills/agent-compass/agents/openai.yaml");
    expect(content).toContain("display_name: Agent Compass");
  });
});
