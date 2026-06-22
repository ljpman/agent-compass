import type { Recommendation, TaskAnalysis } from "../schema/skillTool.js";
import { resolveLanguage } from "./i18n.js";

export function formatDetailed(
  recommendations: Recommendation[],
  analysis: TaskAnalysis
): string {
  const lang = resolveLanguage(analysis);
  const labels = lang === "zh"
    ? {
        taskAnalysis: "任务分析",
        task: "任务",
        language: "语言",
        categories: "分类",
        uncategorized: "未分类",
        complexity: "复杂度",
        recommendations: "推荐方案",
        type: "类型",
        pitch: "简介",
        reason: "推荐理由",
        quality: "质量信号",
        choose: "适用场景",
        avoid: "避免场景",
        next: "下一步",
        install: "安装命令",
        risk: "风险等级",
        riskReasons: "风险说明",
        score: "评分",
      }
    : {
        taskAnalysis: "Task Analysis",
        task: "Task",
        language: "Language",
        categories: "Categories",
        uncategorized: "uncategorized",
        complexity: "Complexity",
        recommendations: "Recommendations",
        type: "Type",
        pitch: "Summary",
        reason: "Why this",
        quality: "Quality signals",
        choose: "Use when",
        avoid: "Avoid when",
        next: "Next step",
        install: "Install command",
        risk: "Risk level",
        riskReasons: "Risk notes",
        score: "Score",
      };

  let output = `## ${labels.taskAnalysis}\n\n`;
  output += `- ${labels.task}: ${analysis.originalTask}\n`;
  output += `- ${labels.language}: ${analysis.language}\n`;
  output += `- ${labels.categories}: ${analysis.categories.join(", ") || labels.uncategorized}\n`;
  output += `- ${labels.complexity}: ${analysis.complexity}\n\n`;

  output += `## ${labels.recommendations}\n\n`;

  for (const rec of recommendations) {
    output += `### ${rec.rank}. ${rec.displayName}\n\n`;
    output += `- ${labels.type}: ${rec.type}\n`;
    output += `- ${labels.pitch}: ${rec.shortPitch}\n`;
    output += `- ${labels.reason}: ${rec.whyThis}\n`;
    if (rec.qualityNote) {
      output += `- ${labels.quality}: ${rec.qualityNote}\n`;
    }
    output += `- ${labels.choose}: ${rec.chooseWhen}\n`;
    output += `- ${labels.avoid}: ${rec.avoidWhen}\n`;
    output += `- ${labels.next}: ${rec.nextAction}\n`;
    if (rec.installCommand) {
      output += `- ${labels.install}: ${rec.installCommand}\n`;
    }
    output += `- ${labels.risk}: ${rec.safety.riskLevel}\n`;

    if (rec.safety.reasons.length > 0) {
      output += `- ${labels.riskReasons}: ${rec.safety.reasons.join("; ")}\n`;
    }

    output += `- ${labels.score}: ${rec.score.total}/100`;
    if (lang === "zh") {
      output += ` (任务适配 ${rec.score.taskFit}, 质量 ${rec.score.quality}, `;
      output += `专精度 ${rec.score.specificity}, 可用性 ${rec.score.availability}, `;
      output += `安全性 ${rec.score.safety}, 偏好匹配 ${rec.score.preferenceFit}, `;
      output += `置信度 ${rec.score.confidence})\n`;
    } else {
      output += ` (task fit ${rec.score.taskFit}, quality ${rec.score.quality}, `;
      output += `specificity ${rec.score.specificity}, availability ${rec.score.availability}, `;
      output += `safety ${rec.score.safety}, preference fit ${rec.score.preferenceFit}, `;
      output += `confidence ${rec.score.confidence})\n`;
    }

    output += `\n`;
  }

  return output;
}
