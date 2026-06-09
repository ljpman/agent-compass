import { execSync } from "node:child_process";
import type { SkillToolManifest, SafetyAssessment } from "../schema/skillTool.js";

export interface EnableResult {
  success: boolean;
  message: string;
  output?: string;
}

export function enableSkillTool(
  entry: SkillToolManifest,
  safety: SafetyAssessment,
  dryRun: boolean = false
): EnableResult {
  // Safety check
  if (safety.recommendedMode === "blocked") {
    return {
      success: false,
      message: "安全风险过高，已阻止启用。建议选择其他工具。",
    };
  }

  if (!entry.enablement?.command) {
    return {
      success: true,
      message: `${entry.displayName} 无需额外启用，可以直接使用。`,
    };
  }

  if (dryRun) {
    return {
      success: true,
      message: `[试运行] 将执行: ${entry.enablement.command}`,
      output: entry.enablement.command,
    };
  }

  // Execute enable command
  try {
    const output = execSync(entry.enablement.command, {
      encoding: "utf-8",
      timeout: 120_000,
      stdio: ["pipe", "pipe", "pipe"],
    });

    // Verify if verifyCommand exists
    if (entry.enablement.verifyCommand) {
      try {
        execSync(entry.enablement.verifyCommand, {
          encoding: "utf-8",
          timeout: 30_000,
          stdio: "pipe",
        });
      } catch {
        return {
          success: false,
          message: `${entry.displayName} 启用命令执行了，但验证失败。可能需要手动配置。`,
          output,
        };
      }
    }

    return {
      success: true,
      message: `${entry.displayName} 已启用。`,
      output,
    };
  } catch (err) {
    return {
      success: false,
      message: `启用失败: ${(err as Error).message}`,
    };
  }
}
