import type { Recommendation } from "../schema/skillTool.js";

export function generateResumeMessage(
  originalTask: string,
  selected: Recommendation
): string {
  return `已启用「${selected.displayName}」。现在继续帮你${originalTask.replace(/^帮我/, "").replace(/^帮/, "")}`;
}

export function generateEnableConfirmMessage(
  selected: Recommendation,
  reasons: string[]
): string {
  const reasonStr = reasons.length > 0 ? `。${reasons[0]}` : "";
  return `「${selected.displayName}」还没启用。${selected.shortPitch}${reasonStr}。确认启用吗？`;
}
