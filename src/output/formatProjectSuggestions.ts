import type { ProjectRecommendationResult } from "../scanner/recommendForProject.js";
import { resolveLanguage, type OutputLanguage } from "./i18n.js";

const NEXT_ACTION_LABELS: Record<OutputLanguage, Record<string, string>> = {
  zh: {
    use_now: "可直接用",
    install_then_use: "可帮你安装",
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

export function formatProjectSuggestions(
  result: ProjectRecommendationResult,
  langInput?: OutputLanguage
): string {
  const lang = resolveLanguage(langInput);
  const { profile, recommendations } = result;

  if (lang === "en") {
    let out = "\n🧭 I scanned your project\n\n";
    out += `Framework: ${profile.framework ?? "not detected"}`;
    if (profile.languages.length > 0) out += ` · Languages: ${profile.languages.join("/")}`;
    if (profile.packageManager) out += ` · Package manager: ${profile.packageManager}`;
    out += "\n";

    const flags: string[] = [];
    flags.push(profile.hasTests ? "✅ tests present" : "⚠️ no tests");
    if (profile.isWebFrontend) flags.push("🌐 frontend app");
    if (profile.hasDatabase) flags.push("🗄️ database connected");
    flags.push(profile.hasErrorMonitoring ? "✅ error monitoring" : "⚠️ no error monitoring");
    if (profile.hasE2E) flags.push("✅ E2E");
    out += `${flags.join(" · ")}\n\n`;

    if (recommendations.length === 0) {
      out += "No obvious skill recommendations for this directory yet. Try another project or describe the task.\n";
      return out;
    }

    out += "These tools look useful here:\n\n";

    for (const rec of recommendations) {
      const actionLabel = NEXT_ACTION_LABELS.en[rec.nextAction] ?? "";
      out += `${rec.rank}. ${rec.displayName} (${rec.type})`;
      if (rec.qualityNote) out += ` — ${rec.qualityNote}`;
      out += "\n";
      out += `   Why: ${rec.projectReason}\n`;
      if (rec.installCommand) {
        out += `   Install: ${rec.installCommand}`;
        if (actionLabel) out += ` (${actionLabel})`;
        out += "\n";
      } else if (rec.sourceUrl) {
        out += `   Get it: ${rec.sourceUrl}`;
        if (actionLabel) out += ` (${actionLabel})`;
        out += "\n";
      }
      out += "\n";
    }

    out += 'Reply "install #N" or "details on #N".\n';
    return out;
  }

  let out = `\n🧭 看了下你的项目\n\n`;
  out += `框架: ${profile.framework ?? "未检测到"}`;
  if (profile.languages.length > 0) out += ` · 语言: ${profile.languages.join("/")}`;
  if (profile.packageManager) out += ` · 包管理: ${profile.packageManager}`;
  out += `\n`;

  const flags: string[] = [];
  flags.push(profile.hasTests ? "✅ 有测试" : "⚠️ 没测试");
  if (profile.isWebFrontend) flags.push("🌐 前端项目");
  if (profile.hasDatabase) flags.push("🗄️ 接了数据库");
  flags.push(profile.hasErrorMonitoring ? "✅ 有错误监控" : "⚠️ 没接错误监控");
  if (profile.hasE2E) flags.push("✅ 有 E2E");
  out += flags.join(" · ") + "\n\n";

  if (recommendations.length === 0) {
    out += `暂时没发现明显能帮上忙的 Skill。换个项目目录试试，或直接说你想做什么。\n`;
    return out;
  }

  out += `这几个 Skill 装上能让你事半功倍：\n\n`;

  for (const rec of recommendations) {
    const actionLabel = NEXT_ACTION_LABELS.zh[rec.nextAction] ?? "";
    out += `${rec.rank}. ${rec.displayName}（${rec.type}）`;
    if (rec.qualityNote) out += ` — ${rec.qualityNote}`;
    out += `\n`;
    out += `   为什么: ${rec.projectReason}\n`;
    if (rec.installCommand) {
      out += `   装它: ${rec.installCommand}`;
      if (actionLabel) out += `（${actionLabel}）`;
      out += `\n`;
    } else if (rec.sourceUrl) {
      out += `   获取: ${rec.sourceUrl}`;
      if (actionLabel) out += `（${actionLabel}）`;
      out += `\n`;
    }
    out += `\n`;
  }

  out += `想装哪个就说"装第 N 个"，或"详细说说第 N 个"。\n`;
  return out;
}
