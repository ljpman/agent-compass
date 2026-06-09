# Agent Compass

> 帮 AI Agent 为每个任务找到最合适的技能。
>
> Agent Compass helps AI agents pick the right skill, plugin, or tool for each task.

你只需要说你想做什么，Agent Compass 帮你选工具。

```
/agent-compass 帮我生成个图
```

```
这个我建议用「图片生成」。最快出图，不用折腾。

也可以选：
1. 图片生成：最快出图
2. 小红书封面设计：更懂封面结构
3. Figma 可编辑设计稿：适合做模板

我建议第 1 个。继续吗？
```

支持 Skills、插件、MCP 服务器、CLI 工具、仓库脚本、工作流——你说任务，它来匹配。

[English Quick Start](#quick-start-english) · [中文快速开始](#快速开始) · [Demo 输出](docs/demo-output.md)

---

## For AI Agents

If you are an AI coding agent (Codex, OpenClaw, Claude Code, Cursor, etc.) installing Agent Compass for a user:

- **Do not** treat this repository as a Codex Skill or OpenClaw Skill.
- Agent Compass is a **Node.js CLI** published on npm.
- Prefer npm/npx:
  ```bash
  npx -y agent-compass ask "<user task>"
  ```
- For persistent installation:
  ```bash
  npm install -g agent-compass
  ```
- Only clone this repository if the user wants to **develop or modify** Agent Compass itself.

See [docs/agent-install.md](docs/agent-install.md) for details.

---

## 快速开始

```bash
# 一行命令试用
npx -y agent-compass ask "帮我生成个图"

# 全局安装
npm install -g agent-compass
agent-compass ask "帮我生成个图"
```

## Quick Start (English)

```bash
# One-shot
npx -y agent-compass ask "generate an image for me"

# Global install
npm install -g agent-compass
agent-compass ask "generate an image for me"
```

## Use inside an AI agent

```bash
npx -y agent-compass setup all
```

Then use:

```
/agent-compass 帮我生成个图
```

Or configure one agent:

```bash
npx -y agent-compass setup codex
npx -y agent-compass setup claude
npx -y agent-compass setup openclaw
npx -y agent-compass setup cursor
```

See [docs/slash-adapters.md](docs/slash-adapters.md) for details.

---

## 为什么需要它？

AI Agent 生态工具越来越多——Skills、插件、MCP、CLI、脚本、工作流。用户不该记住每个工具叫什么、在哪、怎么装。

Agent Compass 让你只说想做什么，它来判断该用什么。

---

## 怎么用

直接说自然语言任务：

```bash
pnpm dev ask "帮我生成个图"
pnpm dev ask "帮我规划一个 AI 工具网站"
pnpm dev ask "帮我分析这个 Excel 哪个渠道转化最好"
pnpm dev ask "帮我修一下登录页 500"
pnpm dev ask "帮我把 PDF 合同整理成风险摘要"
```

回复也是自然语言：

- `用第一个` / `选 1` / `第 2 个` — 选择方案
- `继续` / `确认` — 继续执行
- `换一个` — 换个推荐
- `不要安装新的` — 更新偏好
- `详细说说` — 查看详情
- `json` — 开发者模式

---

## 和工具目录有什么不同？

| | 工具目录 | Agent Compass |
|---|---|---|
| 交互 | 浏览/搜索 | 自然语言对话 |
| 推荐 | 关键词匹配 | 任务分析 + 偏好 + 安全 |
| 启用 | 手动查找安装 | 对话确认后自动启用 |
| 安全 | 无 | 内置安全评估 |

---

## 开发者 CLI

```bash
pnpm dev ask "帮我生成个图"           # 普通推荐
pnpm dev ask "帮我测试网页" --json    # JSON 输出
pnpm dev scan                         # 扫描仓库
pnpm dev validate-registry            # 校验注册表
pnpm dev inspect image-generation     # 查看工具详情
pnpm dev enable playwright-testing    # 试运行启用
```

---

## 安全模型

- **永不静默安装** — 任何启用都需要确认
- **危险命令检测** — `curl | sh`、`sudo`、`rm -rf` 等会被阻止
- **来源验证** — 未知来源不能自动启用
- **风险分级** — low / medium / high / critical

---

## 注册表

每个技能/工具在 `registry/skills-tools.json` 中定义。添加新工具只需编辑这个文件。

详见 [docs/skill-tool-schema.md](docs/skill-tool-schema.md)

---

## Roadmap

- **v0.1** — 本地注册表、对话式 UX、安全检查、仓库扫描、开发者 CLI
- **v0.2** — OpenClaw 集成、MCP 适配器、GitHub 注册表、团队策略
- **v0.3** — 信任元数据、多语言、市场风格注册表
- **v1.0** — 通用 AI Agent 技能选择器、企业策略

---

## 贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT
