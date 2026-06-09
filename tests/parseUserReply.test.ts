import { describe, it, expect } from "vitest";
import { parseUserReply } from "../src/session/parseUserReply.js";

describe("parseUserReply", () => {
  it("解析 '用第一个' 为 select rank 1", () => {
    const result = parseUserReply("用第一个");
    expect(result.action).toBe("select");
    expect(result.value).toBe(1);
  });

  it("解析 '选 1' 为 select rank 1", () => {
    const result = parseUserReply("选 1");
    expect(result.action).toBe("select");
    expect(result.value).toBe(1);
  });

  it("解析 '第 2 个' 为 select rank 2", () => {
    const result = parseUserReply("第 2 个");
    expect(result.action).toBe("select");
    expect(result.value).toBe(2);
  });

  it("解析 '就第一个' 为 select rank 1", () => {
    const result = parseUserReply("就第一个");
    expect(result.action).toBe("select");
    expect(result.value).toBe(1);
  });

  it("解析 '不要安装新的' 为 ask_no_install", () => {
    const result = parseUserReply("不要安装新的");
    expect(result.action).toBe("ask_no_install");
    expect(result.preferenceUpdate?.noNewInstall).toBe(true);
  });

  it("解析 '继续' 为 confirm", () => {
    const result = parseUserReply("继续");
    expect(result.action).toBe("confirm");
  });

  it("解析 '确认' 为 confirm", () => {
    const result = parseUserReply("确认");
    expect(result.action).toBe("confirm");
  });

  it("解析 '换一个' 为 reject", () => {
    const result = parseUserReply("换一个");
    expect(result.action).toBe("reject");
  });

  it("解析 '详细说说' 为 ask_details", () => {
    const result = parseUserReply("详细说说");
    expect(result.action).toBe("ask_details");
  });

  it("解析 'json' 为 ask_json", () => {
    const result = parseUserReply("json");
    expect(result.action).toBe("ask_json");
  });

  it("解析 '用免费的' 更新偏好", () => {
    const result = parseUserReply("用免费的");
    expect(result.action).toBe("ask_no_install");
    expect(result.preferenceUpdate?.preferFree).toBe(true);
  });
});
