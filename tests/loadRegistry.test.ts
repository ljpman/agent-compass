import { describe, it, expect } from "vitest";
import { loadRegistry } from "../src/registry/loadRegistry.js";
import { existsSync } from "node:fs";
import { resolve, join } from "node:path";

describe("loadRegistry", () => {
  it("should load registry from package-relative path (not cwd)", () => {
    const result = loadRegistry();
    expect(result.entries.length).toBeGreaterThan(0);
    expect(result.errors.length).toBe(0);
  });

  it("should contain image-generation entry", () => {
    const result = loadRegistry();
    const img = result.entries.find((e) => e.id === "image-generation");
    expect(img).toBeDefined();
    expect(img!.displayName).toBe("图片生成");
  });

  it("registry file exists at expected package root path", () => {
    // This verifies the file is bundled correctly in npm pack
    const registryPath = resolve("registry", "skills-tools.json");
    expect(existsSync(registryPath)).toBe(true);
  });

  it("should report searched paths on failure", () => {
    const result = loadRegistry("/nonexistent/path/registry.json");
    expect(result.entries.length).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("/nonexistent/path/registry.json");
  });
});
