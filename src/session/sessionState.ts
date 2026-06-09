import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import type { SessionState } from "../schema/skillTool.js";

const STATE_DIR = ".agent-compass";
const STATE_FILE = "state.json";

function getStatePath(cwd: string = process.cwd()): string {
  return resolve(cwd, STATE_DIR, STATE_FILE);
}

export function loadState(cwd: string = process.cwd()): SessionState | null {
  const path = getStatePath(cwd);
  if (!existsSync(path)) return null;

  try {
    const raw = readFileSync(path, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      latestTask: parsed.latestTask,
      latestAnalysis: parsed.latestAnalysis,
      latestPreferences: parsed.latestPreferences,
      latestRecommendations: parsed.latestRecommendations,
      selectedRecommendation: parsed.selectedRecommendation,
      pendingConfirmation: parsed.pendingConfirmation ?? false,
      originalTask: parsed.originalTask,
    };
  } catch {
    return null;
  }
}

export function saveState(state: SessionState, cwd: string = process.cwd()): void {
  const path = getStatePath(cwd);
  const dir = dirname(path);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(path, JSON.stringify(state, null, 2), "utf-8");
}

export function clearState(cwd: string = process.cwd()): void {
  const path = getStatePath(cwd);
  if (existsSync(path)) {
    writeFileSync(path, "{}", "utf-8");
  }
}
