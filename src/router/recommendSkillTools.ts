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

// Short human-readable quality signal, e.g. "官方 · 高人气 · 活跃维护".
// This is what tells the user "为什么值得装".
function generateQualityNote(entry: SkillToolManifest): string | undefined {
  const parts: string[] = [];

  if (entry.trust.level === "official") parts.push("官方");
  else if (entry.trust.level === "verified") parts.push("已验证");

  const q = entry.quality;
  if (q?.popularity === "high") parts.push("高人气");
  else if (q?.popularity === "medium") parts.push("口碑良好");
  if (q?.maintained) parts.push("活跃维护");
  if (q?.maturity === "stable") parts.push("稳定");
  if (typeof q?.stars === "number" && q.stars >= 1000) {
    parts.push(`★${(q.stars / 1000).toFixed(q.stars >= 10000 ? 0 : 1)}k`);
  }

  return parts.length > 0 ? parts.join(" · ") : undefined;
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
    installCommand: entry.enablement?.command,
    sourceUrl: entry.enablement?.sourceUrl ?? entry.enablement?.docsUrl,
    qualityNote: generateQualityNote(entry),
  }));
}
