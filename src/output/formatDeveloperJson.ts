import type {
  Recommendation,
  TaskAnalysis,
  UserPreferences,
} from "../schema/skillTool.js";

export interface DeveloperOutput {
  task: {
    original: string;
    analysis: TaskAnalysis;
    preferences: UserPreferences;
  };
  recommendations: {
    rank: number;
    id: string;
    displayName: string;
    type: string;
    shortPitch: string;
    score: {
      total: number;
      taskFit: number;
      specificity: number;
      availability: number;
      safety: number;
      preferenceFit: number;
      confidence: number;
    };
    safety: {
      riskLevel: string;
      reasons: string[];
      requiresUserConfirmation: boolean;
      recommendedMode: string;
    };
    nextAction: string;
    whyThis: string;
    chooseWhen: string;
    avoidWhen: string;
  }[];
  meta: {
    totalCandidates: number;
    returnedCount: number;
    timestamp: string;
  };
}

export function formatDeveloperJson(
  recommendations: Recommendation[],
  analysis: TaskAnalysis,
  preferences: UserPreferences,
  totalCandidates: number
): DeveloperOutput {
  return {
    task: {
      original: analysis.originalTask,
      analysis,
      preferences,
    },
    recommendations: recommendations.map((rec) => ({
      rank: rec.rank,
      id: rec.id,
      displayName: rec.displayName,
      type: rec.type,
      shortPitch: rec.shortPitch,
      score: rec.score,
      safety: rec.safety,
      nextAction: rec.nextAction,
      whyThis: rec.whyThis,
      chooseWhen: rec.chooseWhen,
      avoidWhen: rec.avoidWhen,
    })),
    meta: {
      totalCandidates,
      returnedCount: recommendations.length,
      timestamp: new Date().toISOString(),
    },
  };
}
