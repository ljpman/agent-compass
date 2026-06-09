// ── Public API ─────────────────────────────────────────────────────
export { askAgentCompass, type AskResult } from "./router/askAgentCompass.js";
export { recommendSkillTools } from "./router/recommendSkillTools.js";

export { analyzeTask } from "./analyzer/analyzeTask.js";
export { extractPreferences, mergePreferences } from "./preferences/extractPreferences.js";
export { scanRepo, type ScanResult } from "./scanner/scanRepo.js";

export { scoreSkillTool } from "./scoring/scoreSkillTool.js";
export { assessSafety } from "./scoring/safety.js";

export { resolveNextAction } from "./actions/resolveNextAction.js";
export { enableSkillTool, type EnableResult } from "./actions/enableSkillTool.js";

export { loadRegistry, type RegistryLoadResult } from "./registry/loadRegistry.js";
export { validateRegistry, type ValidationResult } from "./registry/validateRegistry.js";

export { loadState, saveState, clearState } from "./session/sessionState.js";
export { parseUserReply, type ParsedReply } from "./session/parseUserReply.js";

export { formatConversational } from "./output/formatConversational.js";
export { formatDetailed } from "./output/formatDetailed.js";
export { formatDeveloperJson } from "./output/formatDeveloperJson.js";

// ── Schema re-exports ──────────────────────────────────────────────
export type {
  SkillToolManifest,
  SkillToolType,
  TrustLevel,
  RiskLevel,
  Recommendation,
  RecommendationScore,
  SafetyAssessment,
  NextAction,
  UserPreferences,
  TaskAnalysis,
  TaskCategory,
  SessionState,
} from "./schema/skillTool.js";
