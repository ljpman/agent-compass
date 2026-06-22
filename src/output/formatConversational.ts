import type { Recommendation } from "../schema/skillTool.js";
import { resolveLanguage, STR, type OutputLanguage } from "./i18n.js";

const NEXT_ACTION_LABELS: Record<OutputLanguage, Record<string, string>> = {
  zh: {
    use_now: "可直接用",
    install_then_use: "未启用，可帮你启用",
    configure_then_use: "需要先配置",
    authorize_then_use: "需要授权",
    explain_only: "需了解详情",
    blocked: "暂不可用",
  },
  en: {
    use_now: "ready",
    install_then_use: "can install",
    configure_then_use: "needs setup",
    authorize_then_use: "needs auth",
    explain_only: "details first",
    blocked: "blocked",
  },
};

function getRecommendationLabel(rec: Recommendation, lang: OutputLanguage): string {
  const actionLabel = NEXT_ACTION_LABELS[lang][rec.nextAction] ?? "";
  const separator = lang === "zh" ? "：" : ": ";
  return actionLabel ? `${rec.displayName}${separator}${actionLabel}` : rec.displayName;
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
  _originalTask: string,
  langInput?: OutputLanguage
): string {
  const lang = resolveLanguage(langInput);
  const str = STR[lang];

  if (recommendations.length === 0) {
    return str.none;
  }

  const top = recommendations[0];
  const why = getWhyLine(top);
  const sentenceEnd = lang === "zh" ? "。" : ".";
  const leadJoiner = lang === "zh" ? "，" : ", ";

  let output = str.suggestLead(top.displayName);
  const lead = [why, top.qualityNote].filter(Boolean).join(leadJoiner);
  output += lead ? `${sentenceEnd} ${lead}${sentenceEnd}\n\n` : `${sentenceEnd}\n\n`;

  // Build alternatives (max 3 total)
  const all = recommendations.slice(0, 3);
  if (all.length > 1) {
    output += `${str.alts}\n`;
    for (const rec of all) {
      let line = `${rec.rank}. ${getRecommendationLabel(rec, lang)}`;
      if (rec.qualityNote) line += `（${rec.qualityNote}）`;
      output += `${line}\n`;
    }
    output += `\n`;
  }

  // Install hint for the top pick when it isn't ready to use yet.
  if (top.nextAction !== "use_now") {
    if (top.installCommand) {
      output += `${str.install}${top.installCommand}\n\n`;
    } else if (top.sourceUrl) {
      output += `${str.fetch}${top.sourceUrl}\n\n`;
    }
  }

  output += str.confirmTail(top.rank);

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
