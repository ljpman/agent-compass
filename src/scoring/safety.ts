import type {
  SkillToolManifest,
  SafetyAssessment,
  RiskLevel,
} from "../schema/skillTool.js";

const DANGEROUS_PATTERNS = [
  /curl[\s\S]*\|\s*sh/i,
  /wget[\s\S]*\|\s*sh/i,
  /sudo\b/,
  /rm\s+-rf/,
  /chmod\s+777/,
  />\s*~\/\.\w+rc/,
  />\s*~\/\.\w+profile/,
  /eval\s*\(/,
  /exec\s*\(/,
];

function detectDangerousCommands(command?: string): string[] {
  if (!command) return [];
  const reasons: string[] = [];
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(command)) {
      reasons.push(`命令包含危险模式: ${pattern.source}`);
    }
  }
  return reasons;
}

export function assessSafety(entry: SkillToolManifest): SafetyAssessment {
  const reasons: string[] = [];
  let riskScore = 0;

  // Permission-based risk
  if (entry.permissions.runsShell) {
    reasons.push("需要执行 Shell 命令");
    riskScore += 2;
  }
  if (entry.permissions.writesFiles) {
    reasons.push("会写入文件");
    riskScore += 1;
  }
  if (entry.permissions.modifiesRepo) {
    reasons.push("会修改仓库");
    riskScore += 2;
  }
  if (entry.permissions.accessesSecrets) {
    reasons.push("需要访问密钥");
    riskScore += 5;
  }
  if (entry.permissions.usesNetwork) {
    reasons.push("需要网络访问");
    riskScore += 1;
  }
  if (entry.permissions.externalService) {
    reasons.push("依赖外部服务");
    riskScore += 1;
  }

  // Trust-based risk
  if (entry.trust.level === "unknown") {
    reasons.push("来源未知");
    riskScore += 4;
  }
  if (entry.trust.level === "community") {
    riskScore += 1;
  }

  // Enablement risk
  if (entry.enablement?.required) {
    reasons.push("需要启用/安装");
    riskScore += 1;

    // Check for dangerous enable commands
    const dangerous = detectDangerousCommands(entry.enablement.command);
    if (dangerous.length > 0) {
      reasons.push(...dangerous);
      riskScore += 6;
    }
  }

  // Determine risk level
  let riskLevel: RiskLevel;
  if (riskScore <= 2) riskLevel = "low";
  else if (riskScore <= 4) riskLevel = "medium";
  else if (riskScore <= 6) riskLevel = "high";
  else riskLevel = "critical";

  // Determine recommended mode
  let recommendedMode: SafetyAssessment["recommendedMode"];
  if (riskLevel === "critical") {
    recommendedMode = "blocked";
  } else if (riskLevel === "high") {
    recommendedMode = "explain_only";
  } else if (riskLevel === "medium" && entry.enablement?.required) {
    recommendedMode = "confirm_before_enable";
  } else if (entry.availability.status === "available") {
    recommendedMode = "use_now";
  } else {
    recommendedMode = "confirm_before_enable";
  }

  const requiresUserConfirmation =
    recommendedMode === "confirm_before_enable" ||
    recommendedMode === "explain_only" ||
    recommendedMode === "blocked";

  return {
    riskLevel,
    reasons,
    requiresUserConfirmation,
    recommendedMode,
  };
}
