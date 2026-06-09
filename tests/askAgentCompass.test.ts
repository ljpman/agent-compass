import { describe, it, expect } from "vitest";
import { askAgentCompass } from "../src/router/askAgentCompass.js";
import { loadRegistry } from "../src/registry/loadRegistry.js";

const registry = loadRegistry();

describe("askAgentCompass", () => {
  it("中文图片生成任务推荐图片生成第一", () => {
    const result = askAgentCompass("帮我生成个图");
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations[0].id).toBe("image-generation");
  });

  it("小红书封面任务推荐社媒封面设计", () => {
    const result = askAgentCompass("帮我生成一张小红书封面图");
    expect(result.recommendations.length).toBeGreaterThan(0);
    const ids = result.recommendations.map((r) => r.id);
    expect(ids).toContain("social-media-cover");
    expect(ids).toContain("image-generation");
  });

  it("AI工具网站规划推荐产品规划第一", () => {
    const result = askAgentCompass("帮我规划一个 AI 工具网站");
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations[0].id).toBe("product-planning");
  });

  it("登录页500错误推荐debugging相关", () => {
    const result = askAgentCompass("帮我修一下登录页 500");
    expect(result.recommendations.length).toBeGreaterThan(0);
    const ids = result.recommendations.map((r) => r.id);
    expect(ids.some((id) => ["code-editing", "repo-script-runner"].includes(id))).toBe(true);
  });

  it("Excel转化分析推荐表格数据分析", () => {
    const result = askAgentCompass("帮我分析这个 Excel 哪个渠道转化最好");
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations[0].id).toBe("spreadsheet-analysis");
  });

  it("首页感觉空推荐UI审查", () => {
    const result = askAgentCompass("首页感觉空帮我看看");
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations[0].id).toBe("ui-review");
  });

  it("抖音脚本推荐短视频脚本", () => {
    const result = askAgentCompass("帮我写个抖音脚本");
    expect(result.recommendations.length).toBeGreaterThan(0);
    const ids = result.recommendations.map((r) => r.id);
    expect(ids).toContain("short-video-script");
  });

  it("PDF合同推荐合同风险整理和PDF提取", () => {
    const result = askAgentCompass("帮我把 PDF 合同整理成风险摘要");
    expect(result.recommendations.length).toBeGreaterThan(0);
    const ids = result.recommendations.map((r) => r.id);
    expect(ids).toContain("contract-risk-summary");
    expect(ids).toContain("pdf-extraction");
  });

  it("浏览器checkout测试推荐Playwright", () => {
    const result = askAgentCompass("帮我测试 checkout 流程");
    expect(result.recommendations.length).toBeGreaterThan(0);
    const ids = result.recommendations.map((r) => r.id);
    expect(ids).toContain("playwright-testing");
  });
});
