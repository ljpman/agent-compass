import { describe, it, expect } from "vitest";
import { scanRepo } from "../src/scanner/scanRepo.js";
import { resolve } from "node:path";

describe("scanRepo", () => {
  it("能扫描自身仓库", () => {
    const result = scanRepo(resolve(import.meta.dirname, ".."));
    // Should detect package.json scripts
    expect(result.scripts).toBeDefined();
    expect(Object.keys(result.scripts).length).toBeGreaterThan(0);
  });

  it("检测到 packageManager", () => {
    const result = scanRepo(resolve(import.meta.dirname, ".."));
    // May or may not detect, but should not throw
    expect(["npm", "pnpm", "yarn", null]).toContain(result.packageManager);
  });
});
