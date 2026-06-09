import type {
  SkillToolManifest,
  TaskAnalysis,
  UserPreferences,
  Recommendation,
} from "../schema/skillTool.js";
import { scoreSkillTool } from "../scoring/scoreSkillTool.js";
import { assessSafety } from "../scoring/safety.js";
import { resolveNextAction } from "../actions/resolveNextAction.js";

const WHY_TEMPLATES = [
  (e: SkillToolManifest) => `${e.shortPitch}`,
  (e: SkillToolManifest) => e.uniqueAdvantages[0] ?? "",
  (e: SkillToolManifest) => `${e.bestFor[0] ?? ""}最对口`,
];

function generateWhyThis(entry: SkillToolManifest, analysis: TaskAnalysis): string {
  const matchedBestFor = entry.bestFor.filter((bf) =>
    analysis.originalTask.toLowerCase().includes(bf.toLowerCase())
  );

  // If we matched a specific bestFor, use a natural reason
  if (matchedBestFor.length > 0) {
    const templates = [
      `${matchedBestFor[0]}最对口`,
      `专门做${matchedBestFor[0]}`,
      `擅长${matchedBestFor[0]}`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Fallback to short templates
  for (const tpl of WHY_TEMPLATES) {
    const reason = tpl(entry);
    if (reason && reason.length < 20) return reason;
  }

  return entry.shortPitch;
}

function generateChooseWhen(entry: SkillToolManifest): string {
  return entry.bestFor[0] ?? entry.shortPitch;
}

function generateAvoidWhen(entry: SkillToolManifest): string {
  return entry.avoidWhen[0] ?? "无特殊限制";
}

export function recommendSkillTools(
  analysis: TaskAnalysis,
  entries: SkillToolManifest[],
  preferences: UserPreferences = {},
  limit: number = 3
): Recommendation[] {
  // Score all entries
  const scored = entries
    .map((entry) => ({
      entry,
      score: scoreSkillTool(entry, analysis, preferences),
      safety: assessSafety(entry),
    }))
    .filter(({ score }) => score.total > 10) // filter out very low matches
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, limit);

  return scored.map(({ entry, score, safety }, index) => ({
    rank: index + 1,
    id: entry.id,
    displayName: entry.displayName,
    type: entry.type,
    shortPitch: entry.shortPitch,
    score,
    safety,
    whyThis: generateWhyThis(entry, analysis),
    chooseWhen: generateChooseWhen(entry),
    avoidWhen: generateAvoidWhen(entry),
    nextAction: resolveNextAction(entry, safety),
  }));
}
