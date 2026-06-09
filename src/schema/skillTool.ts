import { z } from "zod";

// ── Enums ──────────────────────────────────────────────────────────
export const SkillToolType = z.enum([
  "skill",
  "plugin",
  "mcp",
  "cli",
  "repo_script",
  "built_in",
  "workflow",
]);
export type SkillToolType = z.infer<typeof SkillToolType>;

export const TrustLevel = z.enum([
  "official",
  "verified",
  "community",
  "local",
  "unknown",
]);
export type TrustLevel = z.infer<typeof TrustLevel>;

export const RiskLevel = z.enum(["low", "medium", "high", "critical"]);
export type RiskLevel = z.infer<typeof RiskLevel>;

export const EnableMethod = z.enum([
  "none",
  "npm",
  "pnpm",
  "yarn",
  "pip",
  "pipx",
  "uv",
  "brew",
  "git",
  "manual",
  "mcp_config",
  "skill_zip",
  "auth",
]);
export type EnableMethod = z.infer<typeof EnableMethod>;

export const AvailabilityStatus = z.enum([
  "available",
  "not_enabled",
  "unknown",
]);
export type AvailabilityStatus = z.infer<typeof AvailabilityStatus>;

// ── Permissions ────────────────────────────────────────────────────
export const Permissions = z.object({
  readsFiles: z.boolean().optional(),
  writesFiles: z.boolean().optional(),
  runsShell: z.boolean().optional(),
  usesNetwork: z.boolean().optional(),
  accessesSecrets: z.boolean().optional(),
  modifiesRepo: z.boolean().optional(),
  externalService: z.boolean().optional(),
});
export type Permissions = z.infer<typeof Permissions>;

// ── Availability ───────────────────────────────────────────────────
export const Availability = z.object({
  status: AvailabilityStatus,
  detected: z.boolean().optional(),
});
export type Availability = z.infer<typeof Availability>;

// ── Enablement ─────────────────────────────────────────────────────
export const Enablement = z.object({
  required: z.boolean(),
  method: EnableMethod.optional(),
  command: z.string().optional(),
  verifyCommand: z.string().optional(),
  uninstallCommand: z.string().optional(),
  sourceUrl: z.string().optional(),
  docsUrl: z.string().optional(),
  checksum: z.string().optional(),
  verified: z.boolean().optional(),
  notes: z.string().optional(),
});
export type Enablement = z.infer<typeof Enablement>;

// ── Execution ──────────────────────────────────────────────────────
export const Execution = z.object({
  suggestedCommand: z.string().optional(),
  requiresConfirmation: z.boolean(),
  dryRunAvailable: z.boolean().optional(),
});
export type Execution = z.infer<typeof Execution>;

// ── Trust ──────────────────────────────────────────────────────────
export const Trust = z.object({
  level: TrustLevel,
  source: z.string().optional(),
  notes: z.string().optional(),
});
export type Trust = z.infer<typeof Trust>;

// ── Skill / Tool Manifest ──────────────────────────────────────────
export const SkillToolManifest = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  shortPitch: z.string(),
  type: SkillToolType,

  description: z.string(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),

  bestFor: z.array(z.string()),
  avoidWhen: z.array(z.string()),
  uniqueAdvantages: z.array(z.string()),
  limitations: z.array(z.string()),
  examples: z.array(z.string()),
  inputSignals: z.array(z.string()),

  permissions: Permissions,
  availability: Availability,
  enablement: Enablement.optional(),
  execution: Execution,
  trust: Trust,
});
export type SkillToolManifest = z.infer<typeof SkillToolManifest>;

// ── Recommendation Score ───────────────────────────────────────────
export const RecommendationScore = z.object({
  total: z.number().min(0).max(100),
  taskFit: z.number().min(0).max(100),
  specificity: z.number().min(0).max(100),
  availability: z.number().min(0).max(100),
  safety: z.number().min(0).max(100),
  preferenceFit: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
});
export type RecommendationScore = z.infer<typeof RecommendationScore>;

// ── Safety Assessment ──────────────────────────────────────────────
export const SafetyAssessment = z.object({
  riskLevel: RiskLevel,
  reasons: z.array(z.string()),
  requiresUserConfirmation: z.boolean(),
  recommendedMode: z.enum([
    "use_now",
    "confirm_before_enable",
    "dry_run",
    "explain_only",
    "blocked",
  ]),
});
export type SafetyAssessment = z.infer<typeof SafetyAssessment>;

// ── Next Action ────────────────────────────────────────────────────
export const NextAction = z.enum([
  "use_now",
  "install_then_use",
  "configure_then_use",
  "authorize_then_use",
  "explain_only",
  "blocked",
]);
export type NextAction = z.infer<typeof NextAction>;

// ── Recommendation ─────────────────────────────────────────────────
export const Recommendation = z.object({
  rank: z.number(),
  id: z.string(),
  displayName: z.string(),
  type: SkillToolType,
  shortPitch: z.string(),
  score: RecommendationScore,
  safety: SafetyAssessment,
  whyThis: z.string(),
  whyNotOthers: z.string().optional(),
  chooseWhen: z.string(),
  avoidWhen: z.string(),
  nextAction: NextAction,
});
export type Recommendation = z.infer<typeof Recommendation>;

// ── User Preferences ───────────────────────────────────────────────
export const UserPreferences = z.object({
  noNewInstall: z.boolean().optional(),
  preferFree: z.boolean().optional(),
  preferLocal: z.boolean().optional(),
  preferFast: z.boolean().optional(),
  preferSafe: z.boolean().optional(),
  preferEditable: z.boolean().optional(),
  preferOfficial: z.boolean().optional(),
  allowNetwork: z.boolean().optional(),
  allowRepoModification: z.boolean().optional(),
  language: z.enum(["zh", "en", "auto"]).optional(),
});
export type UserPreferences = z.infer<typeof UserPreferences>;

// ── Task Analysis ──────────────────────────────────────────────────
export const TaskCategory = z.enum([
  "image_generation",
  "visual_design",
  "social_media_design",
  "planning",
  "product_strategy",
  "coding",
  "debugging",
  "data_analysis",
  "spreadsheet",
  "pdf",
  "document",
  "web_research",
  "browser_automation",
  "ui_review",
  "content_creation",
  "short_video_script",
  "platform_safety_review",
  "deployment",
  "database",
  "api_testing",
  "security_review",
  "performance_review",
]);
export type TaskCategory = z.infer<typeof TaskCategory>;

export const TaskAnalysis = z.object({
  originalTask: z.string(),
  language: z.enum(["zh", "en"]),
  categories: z.array(TaskCategory),
  verbs: z.array(z.string()),
  objects: z.array(z.string()),
  desiredOutput: z.string().optional(),
  complexity: z.enum(["low", "medium", "high"]),
  needsVisualGeneration: z.boolean(),
  needsDesignPlanning: z.boolean(),
  needsCoding: z.boolean(),
  needsDebugging: z.boolean(),
  needsBrowserAutomation: z.boolean(),
  needsDataAnalysis: z.boolean(),
  needsSpreadsheet: z.boolean(),
  needsPdfDocument: z.boolean(),
  needsWebResearch: z.boolean(),
  needsDeployment: z.boolean(),
  needsSafetyCaution: z.boolean(),
});
export type TaskAnalysis = z.infer<typeof TaskAnalysis>;

// ── Session State ──────────────────────────────────────────────────
export const SessionState = z.object({
  latestTask: z.string().optional(),
  latestAnalysis: TaskAnalysis.optional(),
  latestPreferences: UserPreferences.optional(),
  latestRecommendations: z.array(Recommendation).optional(),
  selectedRecommendation: Recommendation.optional(),
  pendingConfirmation: z.boolean(),
  originalTask: z.string().optional(),
});
export type SessionState = z.infer<typeof SessionState>;
