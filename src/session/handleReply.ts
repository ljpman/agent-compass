import { enableSkillTool } from "../actions/enableSkillTool.js";
import {
  generateEnableConfirmMessage,
  generateResumeMessage,
} from "../actions/resumeTask.js";
import { formatConversational, formatSelectConfirm } from "../output/formatConversational.js";
import { formatDetailed } from "../output/formatDetailed.js";
import { formatDeveloperJson } from "../output/formatDeveloperJson.js";
import { loadRegistry } from "../registry/loadRegistry.js";
import { askAgentCompass } from "../router/askAgentCompass.js";
import type { Recommendation, SessionState, SkillToolManifest } from "../schema/skillTool.js";
import { assessSafety } from "../scoring/safety.js";
import { parseUserReply } from "./parseUserReply.js";

export interface ReplyResult {
  message: string;
  state?: SessionState;
  clear: boolean;
}

export interface ReplyOptions {
  execute?: boolean;
}

function hasActiveSession(state: SessionState | null): state is SessionState {
  return Boolean(
    state?.originalTask &&
      state.latestAnalysis &&
      state.latestRecommendations &&
      state.latestRecommendations.length > 0
  );
}

function findSelectedEntry(rec: Recommendation): SkillToolManifest | undefined {
  return loadRegistry().entries.find((entry) => entry.id === rec.id);
}

function selectRecommendation(state: SessionState, rec: Recommendation): ReplyResult {
  const updated: SessionState = {
    ...state,
    selectedRecommendation: rec,
    pendingConfirmation: rec.nextAction !== "use_now",
  };

  if (rec.nextAction === "use_now" || rec.nextAction === "blocked") {
    return {
      message: formatSelectConfirm(rec),
      state: updated,
      clear: false,
    };
  }

  return {
    message: generateEnableConfirmMessage(rec, rec.safety.reasons),
    state: updated,
    clear: false,
  };
}

function getNextRecommendation(state: SessionState): Recommendation | undefined {
  const recs = state.latestRecommendations ?? [];
  const selectedRank = state.selectedRecommendation?.rank ?? 1;
  return recs.find((rec) => rec.rank > selectedRank) ?? recs.find((rec) => rec.rank !== selectedRank);
}

export function handleReply(
  state: SessionState | null,
  reply: string,
  options: ReplyOptions = {}
): ReplyResult {
  if (!hasActiveSession(state)) {
    return {
      message: '没有进行中的会话，请先 `agent-compass ask "<任务>"`',
      clear: false,
    };
  }

  const recommendations = state.latestRecommendations ?? [];
  const analysis = state.latestAnalysis;
  const originalTask = state.originalTask ?? "";
  if (!analysis || recommendations.length === 0 || !originalTask) {
    return {
      message: '没有进行中的会话，请先 `agent-compass ask "<任务>"`',
      clear: false,
    };
  }

  const parsed = parseUserReply(reply);

  if (parsed.action === "select") {
    const max = recommendations.length;
    const selected = recommendations.find((rec) => rec.rank === (parsed.value ?? 0));
    if (!selected) {
      return {
        message: `没找到这个选项。请回复 1-${max} 之间的数字。`,
        state,
        clear: false,
      };
    }
    return selectRecommendation(state, selected);
  }

  if (parsed.action === "confirm") {
    const selected = state.selectedRecommendation ?? recommendations[0];
    if (!selected) {
      return { message: "还没有选择方案。可以先回复「用第一个」。", state, clear: false };
    }

    if (selected.nextAction === "use_now") {
      return {
        message: generateResumeMessage(originalTask, selected),
        clear: true,
      };
    }

    const entry = findSelectedEntry(selected);
    if (!entry) {
      return {
        message: `未找到完整条目: ${selected.id}`,
        state,
        clear: false,
      };
    }

    const safety = assessSafety(entry);
    if (safety.recommendedMode === "blocked") {
      return {
        message: `「${selected.displayName}」安全风险过高，已阻止启用。建议换一个选项。`,
        state,
        clear: false,
      };
    }

    const result = enableSkillTool(entry, safety, !options.execute);
    if (result.success && options.execute) {
      return {
        message: `${result.message}\n${generateResumeMessage(originalTask, selected)}`,
        clear: true,
      };
    }

    return {
      message: result.message,
      state: { ...state, selectedRecommendation: selected, pendingConfirmation: true },
      clear: false,
    };
  }

  if (parsed.action === "reject" || parsed.action === "switch") {
    const next = getNextRecommendation(state);
    if (!next) {
      return {
        message: "没有更多备选了。可以回复「详细说说」查看对比。",
        state,
        clear: false,
      };
    }
    const selected = selectRecommendation(state, next);
    return {
      ...selected,
      message: `换成「${next.displayName}」。\n${selected.message}`,
    };
  }

  if (parsed.action === "ask_details") {
    return {
      message: formatDetailed(recommendations, analysis),
      state,
      clear: false,
    };
  }

  if (parsed.action === "ask_json") {
    const output = formatDeveloperJson(
      recommendations,
      analysis,
      state.latestPreferences ?? {},
      loadRegistry().entries.length
    );
    return {
      message: JSON.stringify(output, null, 2),
      state,
      clear: false,
    };
  }

  if (parsed.preferenceUpdate) {
    const updatedState: SessionState = {
      ...state,
      latestPreferences: {
        ...state.latestPreferences,
        ...parsed.preferenceUpdate,
      },
    };
    const result = askAgentCompass(originalTask, { previousState: updatedState });
    return {
      message: formatConversational(result.recommendations, originalTask),
      state: result.state,
      clear: false,
    };
  }

  return {
    message: "可以回复：用第一个 / 继续 / 换一个 / 详细说说 / json / 不要安装新的",
    state,
    clear: false,
  };
}
