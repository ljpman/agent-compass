import type { Recommendation } from "../schema/skillTool.js";

const NEXT_ACTION_LABELS: Record<string, string> = {
  use_now: "可直接用",
  install_then_use: "未启用，可帮你启用",
  configure_then_use: "需要先配置",
  authorize_then_use: "需要授权",
  explain_only: "需了解详情",
  blocked: "暂不可用",
};

function getRecommendationLabel(rec: Recommendation): string {
  const actionLabel = NEXT_ACTION_LABELS[rec.nextAction] ?? "";
  return actionLabel ? `${rec.displayName}：${actionLabel}` : rec.displayName;
}

function getWhyLine(rec: Recommendation): string {
  // Pick the shortest, most natural reason, avoiding displayName repetition
  const reasons = [
    rec.whyThis,
    rec.chooseWhen,
    rec.shortPitch,
  ].filter((r) => r && r !== rec.displayName);

  // Prefer short reasons
  const best = reasons.sort((a, b) => a.length - b.length)[0] ?? "";
  return best;
}

export function formatConversational(
  recommendations: Recommendation[],
  _originalTask: string
): string {
  if (recommendations.length === 0) {
    return "没找到合适的工具。换个描述试试？";
  }

  const top = recommendations[0];
  const why = getWhyLine(top);

  let output = `这个我建议用「${top.displayName}」`;
  output += why ? `。${why}。\n\n` : `。\n\n`;

  // Build alternatives (max 3 total)
  const all = recommendations.slice(0, 3);
  if (all.length > 1) {
    output += `也可以选：\n`;
    for (const rec of all) {
      output += `${rec.rank}. ${getRecommendationLabel(rec)}\n`;
    }
    output += `\n`;
  }

  output += `我建议第 ${top.rank} 个。继续吗？`;

  return output;
}

export function formatSelectConfirm(rec: Recommendation): string {
  if (rec.nextAction === "use_now") {
    return `好的，用「${rec.displayName}」。继续吗？`;
  }
  if (rec.nextAction === "blocked") {
    return `「${rec.displayName}」暂不可用。建议选其他选项。`;
  }
  return `「${rec.displayName}」还没启用。${rec.shortPitch}。确认启用吗？`;
}

export function formatAlreadyAvailable(rec: Recommendation): string {
  return `「${rec.displayName}」已经可以用了。继续吗？`;
}
