import { describe, expect, it } from "vitest";
import { formatConversational } from "../src/output/formatConversational.js";
import { askAgentCompass } from "../src/router/askAgentCompass.js";

describe("output i18n", () => {
  it("uses English scaffolding for English tasks", () => {
    const result = askAgentCompass("generate an image for me");
    const output = formatConversational(
      result.recommendations,
      result.analysis.originalTask,
      result.analysis.language
    );

    expect(output).toContain("I'd suggest");
    expect(output).toContain("Continue?");
  });

  it("uses English install labels when the top pick needs installation", () => {
    const result = askAgentCompass("test the checkout flow in a browser");
    const output = formatConversational(
      result.recommendations,
      result.analysis.originalTask,
      result.analysis.language
    );

    expect(output).toContain("I'd suggest");
    expect(output).toContain("Install: ");
  });

  it("keeps Chinese scaffolding for Chinese tasks", () => {
    const result = askAgentCompass("帮我生成个图");
    const output = formatConversational(
      result.recommendations,
      result.analysis.originalTask,
      result.analysis.language
    );

    expect(output).toContain("这个我建议用");
    expect(output).toContain("继续吗？");
  });
});
