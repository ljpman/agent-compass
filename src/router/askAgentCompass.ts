import type {
  SkillToolManifest,
  TaskAnalysis,
  UserPreferences,
  Recommendation,
  SessionState,
} from "../schema/skillTool.js";
import { analyzeTask } from "../analyzer/analyzeTask.js";
import { extractPreferences } from "../preferences/extractPreferences.js";
import { recommendSkillTools } from "./recommendSkillTools.js";
import { loadRegistry } from "../registry/loadRegistry.js";
import { scanRepo } from "../scanner/scanRepo.js";

export interface AskResult {
  analysis: TaskAnalysis;
  preferences: UserPreferences;
  recommendations: Recommendation[];
  state: SessionState;
}

export function askAgentCompass(
  task: string,
  options?: {
    registryEntries?: SkillToolManifest[];
    followUp?: string;
    previousState?: SessionState;
    includeRepoScripts?: boolean;
  }
): AskResult {
  // Load registry entries
  let entries = options?.registryEntries ?? [];
  if (entries.length === 0) {
    const loaded = loadRegistry();
    entries = loaded.entries;
  }

  // Optionally include repo scripts
  if (options?.includeRepoScripts !== false) {
    const scan = scanRepo();
    entries = [...entries, ...scan.detected];
  }

  // Analyze task
  const analysis = analyzeTask(task);

  // Extract preferences
  const prefsFromTask = extractPreferences(task, options?.followUp);
  const preferences = options?.previousState?.latestPreferences
    ? { ...options.previousState.latestPreferences, ...prefsFromTask }
    : prefsFromTask;

  // Get recommendations
  const recommendations = recommendSkillTools(analysis, entries, preferences, 3, analysis.language);

  // Build state
  const state: SessionState = {
    latestTask: task,
    latestAnalysis: analysis,
    latestPreferences: preferences,
    latestRecommendations: recommendations,
    pendingConfirmation: false,
    originalTask: task,
  };

  return { analysis, preferences, recommendations, state };
}
