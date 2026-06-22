import type {
  TaskCategory,
  TaskAnalysis,
  SkillToolManifest,
  UserPreferences,
  Recommendation,
} from "../schema/skillTool.js";
import { scanRepo, type ScanResult } from "./scanRepo.js";
import { recommendSkillTools } from "../router/recommendSkillTools.js";
import { loadRegistry } from "../registry/loadRegistry.js";

// ── Project profile ────────────────────────────────────────────────
// A higher-level read of "what is this project + what is it missing",
// derived from the raw scan.
export interface ProjectProfile {
  framework: string | null;
  packageManager: string | null;
  languages: string[];
  isWebFrontend: boolean;
  hasDatabase: boolean;
  hasErrorMonitoring: boolean;
  hasE2E: boolean;
  hasTests: boolean;
}

export interface ProjectNeed {
  category: TaskCategory;
  reason: string;
}

export interface ProjectRecommendation extends Recommendation {
  projectReason: string;
}

export interface ProjectRecommendationResult {
  profile: ProjectProfile;
  needs: ProjectNeed[];
  recommendations: ProjectRecommendation[];
}

const DB_DEPS = [
  "prisma",
  "@prisma/client",
  "pg",
  "mysql",
  "mysql2",
  "mongoose",
  "mongodb",
  "drizzle-orm",
  "sequelize",
  "typeorm",
  "knex",
  "@supabase/supabase-js",
];

const E2E_DEPS = ["playwright", "@playwright/test", "cypress", "puppeteer"];

const TEST_DEPS = ["vitest", "jest", "mocha", "@playwright/test", "cypress", "ava"];

const FRONTEND_FRAMEWORKS = ["nextjs", "vite", "react", "vue", "svelte"];

function hasDep(deps: Record<string, string>, name: string): boolean {
  return Object.prototype.hasOwnProperty.call(deps, name);
}

function hasAnyDep(deps: Record<string, string>, names: string[]): boolean {
  return names.some((n) => hasDep(deps, n));
}

function hasDepPrefix(deps: Record<string, string>, prefix: string): boolean {
  return Object.keys(deps).some((d) => d.startsWith(prefix));
}

// ── Build profile from a raw scan ──────────────────────────────────
export function buildProjectProfile(scan: ScanResult): ProjectProfile {
  const deps = scan.dependencies;
  const languages: string[] = [];

  if (hasDep(deps, "typescript")) languages.push("TypeScript");
  if (scan.framework === "python" || scan.framework === "fastapi") languages.push("Python");
  if (Object.keys(deps).length > 0 && !languages.includes("TypeScript")) {
    languages.push("JavaScript");
  }

  const isWebFrontend =
    (scan.framework !== null && FRONTEND_FRAMEWORKS.includes(scan.framework)) ||
    hasAnyDep(deps, ["react", "vue", "svelte"]);

  return {
    framework: scan.framework,
    packageManager: scan.packageManager,
    languages,
    isWebFrontend,
    hasDatabase: hasAnyDep(deps, DB_DEPS),
    hasErrorMonitoring:
      hasDepPrefix(deps, "@sentry/") || hasAnyDep(deps, ["bugsnag", "@datadog/browser-rum"]),
    hasE2E: hasAnyDep(deps, E2E_DEPS),
    hasTests:
      Object.prototype.hasOwnProperty.call(scan.scripts, "test") || hasAnyDep(deps, TEST_DEPS),
  };
}

// ── Derive needs (pure) ────────────────────────────────────────────
// Maps a project profile to a set of capability needs + human reasons.
export function deriveProjectNeeds(profile: ProjectProfile): ProjectNeed[] {
  const needs: ProjectNeed[] = [];
  const seen = new Set<TaskCategory>();
  const add = (category: TaskCategory, reason: string) => {
    if (seen.has(category)) return;
    seen.add(category);
    needs.push({ category, reason });
  };

  const isCodeProject = profile.framework !== null || profile.languages.length > 0;
  // An "app" actually runs somewhere (web frontend or a known framework),
  // as opposed to a library/CLI. Some needs (e.g. error monitoring) only
  // make sense for apps.
  const isApp = profile.isWebFrontend || profile.framework !== null;

  // Project-specific needs first, so they outrank the generic coding aid.
  if (profile.isWebFrontend) {
    add("browser_automation", "前端项目：用真实浏览器覆盖登录/下单等关键流程");
    add("ui_review", "有 UI：可做布局、间距、可用性审查");
  }

  if (profile.framework === "nextjs") {
    add("performance_review", "Next.js 项目：首屏加载和打包体积值得盯");
  }

  if (profile.hasDatabase) {
    add("database", "项目接了数据库：让 agent 直接查询/改表/生成迁移更省事");
  }

  if (isApp && !profile.hasErrorMonitoring) {
    add("debugging", "还没接错误监控：线上报错只能靠猜，接上能直接看堆栈");
  }

  // Generic coding aid last — relevant to any code project but least specific.
  if (isCodeProject) {
    add("coding", "代码项目通用提效：查最新文档、给 agent 文件与上下文能力");
  }

  return needs;
}

// ── Orchestrator ───────────────────────────────────────────────────
export function recommendForProject(
  cwd: string = process.cwd(),
  options: {
    registryEntries?: SkillToolManifest[];
    preferences?: UserPreferences;
    limit?: number;
  } = {}
): ProjectRecommendationResult {
  const scan = scanRepo(cwd);
  const profile = buildProjectProfile(scan);
  const needs = deriveProjectNeeds(profile);

  if (needs.length === 0) {
    return { profile, needs, recommendations: [] };
  }

  // Candidates = installable catalog entries (things to *add*), not the
  // project's own built-in capabilities or repo scripts.
  let entries = options.registryEntries ?? loadRegistry().entries;
  entries = entries.filter((e) => e.enablement?.required === true);

  const needCategories = needs.map((n) => n.category);

  // Reuse the existing scoring engine via a synthetic analysis whose
  // categories carry the project's needs. taskFit then scores on category
  // overlap, and quality/safety/availability flow through unchanged.
  const analysis: TaskAnalysis = {
    originalTask: `project:${profile.framework ?? "generic"}`,
    language: "zh",
    categories: needCategories,
    verbs: [],
    objects: [],
    complexity: "medium",
    needsVisualGeneration: false,
    needsDesignPlanning: false,
    needsCoding: needCategories.includes("coding"),
    needsDebugging: needCategories.includes("debugging"),
    needsBrowserAutomation: needCategories.includes("browser_automation"),
    needsDataAnalysis: false,
    needsSpreadsheet: false,
    needsPdfDocument: false,
    needsWebResearch: false,
    needsDeployment: false,
    needsSafetyCaution: false,
  };

  const limit = options.limit ?? 5;

  // Score every candidate once (sorted by total desc).
  const allRecs = recommendSkillTools(
    analysis,
    entries,
    options.preferences ?? {},
    entries.length
  );

  const entryById = new Map(entries.map((e) => [e.id, e]));
  const selected: ProjectRecommendation[] = [];
  const usedIds = new Set<string>();

  // A tool "addresses" a need only when its PRIMARY (first) category matches —
  // i.e. that's what the tool is mainly for. This keeps reasons accurate and
  // stops a monitoring tool from being grabbed by a "performance" need just
  // because it lists performance as a secondary category.
  const reasonFor = (id: string): string | undefined => {
    const primary = entryById.get(id)?.categories[0];
    return needs.find((n) => n.category === primary)?.reason;
  };

  // 1) Coverage: pick the best installable tool for each detected need,
  //    in need-priority order, so no detected need is left unrepresented.
  for (const need of needs) {
    const rec = allRecs.find(
      (r) => !usedIds.has(r.id) && entryById.get(r.id)?.categories[0] === need.category
    );
    if (rec) {
      usedIds.add(rec.id);
      selected.push({ ...rec, projectReason: need.reason });
    }
  }

  // 2) Fill remaining slots with the next-best overall candidates.
  for (const rec of allRecs) {
    if (selected.length >= limit) break;
    if (usedIds.has(rec.id)) continue;
    usedIds.add(rec.id);
    selected.push({ ...rec, projectReason: reasonFor(rec.id) ?? rec.whyThis });
  }

  // Renumber to reflect final display order (coverage first, then fill).
  const recommendations = selected
    .slice(0, limit)
    .map((rec, i) => ({ ...rec, rank: i + 1 }));

  return { profile, needs, recommendations };
}
