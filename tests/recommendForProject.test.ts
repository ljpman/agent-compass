import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import {
  buildProjectProfile,
  deriveProjectNeeds,
  recommendForProject,
  type ProjectProfile,
} from "../src/scanner/recommendForProject.js";
import type { ScanResult } from "../src/scanner/scanRepo.js";

function makeScan(partial: Partial<ScanResult>): ScanResult {
  return {
    detected: [],
    framework: null,
    packageManager: null,
    scripts: {},
    dependencies: {},
    ...partial,
  };
}

describe("buildProjectProfile", () => {
  it("识别 Next.js + 数据库 + 无监控 的前端应用", () => {
    const profile = buildProjectProfile(
      makeScan({
        framework: "nextjs",
        packageManager: "npm",
        scripts: { dev: "next dev" },
        dependencies: { next: "14", react: "18", pg: "^8", typescript: "^5" },
      })
    );

    expect(profile.isWebFrontend).toBe(true);
    expect(profile.hasDatabase).toBe(true);
    expect(profile.hasErrorMonitoring).toBe(false);
    expect(profile.languages).toContain("TypeScript");
  });

  it("识别已接入 Sentry 的项目", () => {
    const profile = buildProjectProfile(
      makeScan({ dependencies: { "@sentry/node": "^7", express: "^4" } })
    );
    expect(profile.hasErrorMonitoring).toBe(true);
  });
});

describe("deriveProjectNeeds", () => {
  const nextDbProfile: ProjectProfile = {
    framework: "nextjs",
    packageManager: "npm",
    languages: ["TypeScript"],
    isWebFrontend: true,
    hasDatabase: true,
    hasErrorMonitoring: false,
    hasE2E: false,
    hasTests: false,
  };

  it("为 Next.js+DB+无监控 项目推导出对应需求", () => {
    const cats = deriveProjectNeeds(nextDbProfile).map((n) => n.category);
    expect(cats).toContain("browser_automation");
    expect(cats).toContain("performance_review");
    expect(cats).toContain("database");
    expect(cats).toContain("debugging"); // no error monitoring
    expect(cats).toContain("coding");
  });

  it("通用 coding 需求排在最后（最不具体）", () => {
    const cats = deriveProjectNeeds(nextDbProfile).map((n) => n.category);
    expect(cats[cats.length - 1]).toBe("coding");
  });

  it("库/CLI 项目不触发错误监控需求", () => {
    const libProfile: ProjectProfile = {
      framework: null,
      packageManager: "pnpm",
      languages: ["TypeScript"],
      isWebFrontend: false,
      hasDatabase: false,
      hasErrorMonitoring: false,
      hasE2E: false,
      hasTests: true,
    };
    const cats = deriveProjectNeeds(libProfile).map((n) => n.category);
    expect(cats).toEqual(["coding"]);
  });
});

describe("recommendForProject", () => {
  it("对本仓库（TS 库）只推 coding 类工具，不推数据库/监控", () => {
    const result = recommendForProject(resolve(import.meta.dirname, ".."));
    const ids = result.recommendations.map((r) => r.id);

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(ids).toContain("context7-mcp");
    expect(ids).not.toContain("supabase-mcp");
    expect(ids).not.toContain("sentry-mcp");
  });

  it("每条推荐都带项目相关理由和获取方式（命令或来源链接）", () => {
    const result = recommendForProject(resolve(import.meta.dirname, ".."));
    for (const rec of result.recommendations) {
      expect(rec.projectReason.length).toBeGreaterThan(0);
      // Addable via a shell command, or a marketplace/source link.
      expect(rec.installCommand ?? rec.sourceUrl).toBeTruthy();
    }
  });
});
