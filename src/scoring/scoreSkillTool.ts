import type {
  SkillToolManifest,
  TaskAnalysis,
  UserPreferences,
  RecommendationScore,
} from "../schema/skillTool.js";

// ── Weight config ──────────────────────────────────────────────────
const WEIGHTS = {
  taskFit: 0.35,
  quality: 0.15,
  specificity: 0.10,
  availability: 0.12,
  safety: 0.10,
  preferenceFit: 0.08,
  confidence: 0.10,
} as const;

// ── Task fit ───────────────────────────────────────────────────────

function computeTaskFit(entry: SkillToolManifest, analysis: TaskAnalysis): number {
  let score = 0;
  const taskLower = analysis.originalTask.toLowerCase();

  // Match against bestFor
  for (const bf of entry.bestFor) {
    if (taskLower.includes(bf.toLowerCase())) {
      score += 20;
    }
  }

  // Match against inputSignals
  for (const sig of entry.inputSignals) {
    if (taskLower.includes(sig.toLowerCase())) {
      score += 10;
    }
  }

  // Match against categories
  for (const cat of analysis.categories) {
    if (entry.categories.includes(cat)) {
      score += 15;
    }
  }

  // Avoid penalty
  for (const aw of entry.avoidWhen) {
    if (taskLower.includes(aw.toLowerCase())) {
      score -= 20;
    }
  }

  return Math.max(0, Math.min(100, score));
}

// ── Specificity ────────────────────────────────────────────────────

function computeSpecificity(entry: SkillToolManifest, analysis: TaskAnalysis): number {
  let score = 50; // baseline

  // More specific entries score higher
  if (entry.bestFor.length > 0) score += 10;
  if (entry.inputSignals.length > 3) score += 10;
  if (entry.uniqueAdvantages.length > 0) score += 10;
  if (entry.examples.length > 0) score += 5;

  // Penalty for very generic entries
  if (entry.categories.length > 4) score -= 10;

  // Bonus for exact category match
  for (const cat of analysis.categories) {
    if (entry.categories.includes(cat)) {
      score += 5;
    }
  }

  return Math.max(0, Math.min(100, score));
}

// ── Availability ───────────────────────────────────────────────────

function computeAvailability(entry: SkillToolManifest): number {
  // A skill-finder exists to surface tools you haven't installed yet, so
  // "not_enabled" must stay only a mild signal — the "I don't want to
  // install anything" case is handled separately in preferenceFit.
  if (entry.availability.status === "available") return 100;
  if (entry.availability.status === "not_enabled") return 70;
  return 45;
}

// ── Safety ─────────────────────────────────────────────────────────

function computeSafety(entry: SkillToolManifest): number {
  let score = 100;

  if (entry.permissions.runsShell) score -= 15;
  if (entry.permissions.writesFiles) score -= 10;
  if (entry.permissions.modifiesRepo) score -= 10;
  if (entry.permissions.accessesSecrets) score -= 25;
  if (entry.permissions.usesNetwork) score -= 5;
  if (entry.permissions.externalService) score -= 10;

  if (entry.trust.level === "unknown") score -= 30;
  if (entry.trust.level === "community") score -= 10;
  if (entry.trust.level === "official") score += 10;
  if (entry.trust.level === "verified") score += 5;

  return Math.max(0, Math.min(100, score));
}

// ── Quality ────────────────────────────────────────────────────────
// Curated quality signal — answers "这个 Skill 好不好用？".
// When an entry has no quality block, fall back to a baseline derived
// from its trust level so existing entries keep a sensible score.
function computeQuality(entry: SkillToolManifest): number {
  const q = entry.quality;

  if (!q) {
    switch (entry.trust.level) {
      case "official":
        return 78;
      case "verified":
        return 68;
      case "community":
        return 55;
      case "local":
        return 60;
      default:
        return 40; // unknown
    }
  }

  let score = 50;

  if (q.popularity === "high") score += 30;
  else if (q.popularity === "medium") score += 15;
  else if (q.popularity === "niche") score -= 5;

  if (q.maturity === "stable") score += 15;
  else if (q.maturity === "experimental") score -= 10;

  if (q.maintained === true) score += 10;
  else if (q.maintained === false) score -= 20;

  if (typeof q.stars === "number") {
    if (q.stars >= 10000) score += 15;
    else if (q.stars >= 2000) score += 8;
    else if (q.stars >= 500) score += 3;
  }

  return Math.max(0, Math.min(100, score));
}

// ── Preference fit ─────────────────────────────────────────────────

function computePreferenceFit(
  entry: SkillToolManifest,
  prefs: UserPreferences
): number {
  let score = 50;

  if (prefs.noNewInstall) {
    if (entry.availability.status === "available") score += 30;
    if (entry.enablement?.required) score -= 20;
  }

  if (prefs.preferFast) {
    if (entry.availability.status === "available") score += 15;
    if (!entry.enablement?.required) score += 10;
  }

  if (prefs.preferSafe) {
    if (entry.trust.level === "official") score += 15;
    if (entry.trust.level === "unknown") score -= 20;
    if (!entry.permissions.runsShell) score += 5;
  }

  if (prefs.preferLocal) {
    if (entry.type === "repo_script" || entry.type === "built_in") score += 20;
    if (entry.type === "cli") score += 5;
  }

  if (prefs.preferEditable) {
    if (entry.type === "mcp") score += 15;
  }

  if (prefs.preferOfficial) {
    if (entry.trust.level === "official") score += 20;
  }

  if (prefs.allowNetwork === false) {
    if (entry.permissions.usesNetwork) score -= 30;
  }

  return Math.max(0, Math.min(100, score));
}

// ── Confidence ─────────────────────────────────────────────────────

function computeConfidence(entry: SkillToolManifest, analysis: TaskAnalysis): number {
  let score = 50;

  // Higher confidence for more signals
  const signalMatches = entry.inputSignals.filter((s) =>
    analysis.originalTask.toLowerCase().includes(s.toLowerCase())
  ).length;
  score += Math.min(30, signalMatches * 10);

  // Higher for known trust
  if (entry.trust.level === "official") score += 15;
  if (entry.trust.level === "verified") score += 10;

  return Math.max(0, Math.min(100, score));
}

// ── Main scoring ───────────────────────────────────────────────────

export function scoreSkillTool(
  entry: SkillToolManifest,
  analysis: TaskAnalysis,
  prefs: UserPreferences = {}
): RecommendationScore {
  const taskFit = computeTaskFit(entry, analysis);
  const specificity = computeSpecificity(entry, analysis);
  const availability = computeAvailability(entry);
  const safety = computeSafety(entry);
  const preferenceFit = computePreferenceFit(entry, prefs);
  const confidence = computeConfidence(entry, analysis);
  const quality = computeQuality(entry);

  const total = Math.round(
    taskFit * WEIGHTS.taskFit +
    quality * WEIGHTS.quality +
    specificity * WEIGHTS.specificity +
    availability * WEIGHTS.availability +
    safety * WEIGHTS.safety +
    preferenceFit * WEIGHTS.preferenceFit +
    confidence * WEIGHTS.confidence
  );

  return {
    total: Math.max(0, Math.min(100, total)),
    taskFit,
    specificity,
    availability,
    safety,
    preferenceFit,
    confidence,
    quality,
  };
}
