import type { ProjectRecommendationResult } from "../scanner/recommendForProject.js";

const NEXT_ACTION_LABELS: Record<string, string> = {
  use_now: "可直接用",
  install_then_use: "可帮你安装",
  configure_then_use: "需要先配置",
  authorize_then_use: "需要授权",
  explain_only: "需了解详情",
  blocked: "暂不可用",
};

export function formatProjectSuggestions(result: ProjectRecommendationResult): string {
  const { profile, recommendations } = result;

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
    const actionLabel = NEXT_ACTION_LABELS[rec.nextAction] ?? "";
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
