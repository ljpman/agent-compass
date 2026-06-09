import type {
  SkillToolManifest,
  SafetyAssessment,
  NextAction,
} from "../schema/skillTool.js";

export function resolveNextAction(
  entry: SkillToolManifest,
  safety: SafetyAssessment
): NextAction {
  // Already available - use directly
  if (entry.availability.status === "available") {
    return "use_now";
  }

  // Blocked by safety
  if (safety.recommendedMode === "blocked") {
    return "blocked";
  }

  // Need authorization (external service, secrets)
  if (entry.permissions.accessesSecrets || entry.permissions.externalService) {
    if (entry.enablement?.required) {
      return "authorize_then_use";
    }
  }

  // Need configuration (MCP, manual setup)
  if (entry.enablement?.method === "mcp_config" || entry.enablement?.method === "manual") {
    return "configure_then_use";
  }

  // Need installation
  if (entry.enablement?.required) {
    return "install_then_use";
  }

  // Explain only (high risk)
  if (safety.recommendedMode === "explain_only") {
    return "explain_only";
  }

  return "use_now";
}
