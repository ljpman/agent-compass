import { existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { askAgentCompass } from "../src/router/askAgentCompass.js";
import { handleReply } from "../src/session/handleReply.js";
import { loadState, saveState } from "../src/session/sessionState.js";

const TEST_DIR = resolve(import.meta.dirname, "..", ".test-reply");
const ROOT_DIR = resolve(import.meta.dirname, "..");

function setup(): void {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
  mkdirSync(TEST_DIR, { recursive: true });
  process.chdir(TEST_DIR);
}

function cleanup(): void {
  process.chdir(ROOT_DIR);
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
}

describe("reply flow", () => {
  beforeEach(setup);
  afterEach(cleanup);

  it("selects the first recommendation after ask state is saved", () => {
    const ask = askAgentCompass("帮我生成个图");
    saveState(ask.state);

    const result = handleReply(loadState(), "用第一个");

    expect(result.state?.selectedRecommendation?.id).toBe("image-generation");
    expect(result.message).toContain("图片生成");
  });

  it("continues with dry-run enablement without executing commands", () => {
    const ask = askAgentCompass("帮我测试 checkout 流程");
    saveState({ ...ask.state, selectedRecommendation: ask.recommendations[0] });

    const result = handleReply(loadState(), "继续");

    expect(result.message).toContain("[试运行] 将执行");
    expect(result.message).toContain("npx playwright install");
    expect(result.clear).toBe(false);
  });

  it("switches to the next recommendation", () => {
    const ask = askAgentCompass("帮我测试 checkout 流程");
    saveState({ ...ask.state, selectedRecommendation: ask.recommendations[0] });

    const result = handleReply(loadState(), "换一个");

    expect(result.state?.selectedRecommendation?.id).toBe(ask.recommendations[1].id);
    expect(result.message).toContain("换成");
  });

  it("returns a friendly message when there is no active session", () => {
    const result = handleReply(loadState(), "继续");

    expect(result.message).toContain("没有进行中的会话");
  });
});
