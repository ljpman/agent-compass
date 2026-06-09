import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { validateRegistry } from "../src/registry/validateRegistry.js";

describe("validateRegistry", () => {
  const registryPath = resolve(import.meta.dirname, "..", "registry", "skills-tools.json");

  it("注册表校验通过", () => {
    const result = validateRegistry(registryPath);
    expect(result.valid).toBe(true);
    expect(result.totalEntries).toBeGreaterThanOrEqual(24);
    expect(result.validEntries).toBe(result.totalEntries);
  });

  it("每个条目有必填字段", () => {
    const result = validateRegistry(registryPath);
    expect(result.errors).toHaveLength(0);
  });
});
