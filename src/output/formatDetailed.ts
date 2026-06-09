import type { Recommendation, TaskAnalysis } from "../schema/skillTool.js";

export function formatDetailed(
  recommendations: Recommendation[],
  analysis: TaskAnalysis
): string {
  let output = `## 任务分析\n\n`;
  output += `- 任务: ${analysis.originalTask}\n`;
  output += `- 语言: ${analysis.language}\n`;
  output += `- 分类: ${analysis.categories.join(", ") || "未分类"}\n`;
  output += `- 复杂度: ${analysis.complexity}\n\n`;

  output += `## 推荐方案\n\n`;

  for (const rec of recommendations) {
    output += `### ${rec.rank}. ${rec.displayName}\n\n`;
    output += `- 类型: ${rec.type}\n`;
    output += `- 简介: ${rec.shortPitch}\n`;
    output += `- 推荐理由: ${rec.whyThis}\n`;
    output += `- 适用场景: ${rec.chooseWhen}\n`;
    output += `- 避免场景: ${rec.avoidWhen}\n`;
    output += `- 下一步: ${rec.nextAction}\n`;
    output += `- 风险等级: ${rec.safety.riskLevel}\n`;

    if (rec.safety.reasons.length > 0) {
      output += `- 风险说明: ${rec.safety.reasons.join("; ")}\n`;
    }

    output += `- 评分: ${rec.score.total}/100`;
    output += ` (任务适配 ${rec.score.taskFit}, 专精度 ${rec.score.specificity}, `;
    output += `可用性 ${rec.score.availability}, 安全性 ${rec.score.safety}, `;
    output += `偏好匹配 ${rec.score.preferenceFit}, 置信度 ${rec.score.confidence})\n`;

    output += `\n`;
  }

  return output;
}
