# Changelog

## v0.1.5 (开发中)

把 demo 清单升级成「质量优先的精选 Skill 目录」，让推荐从"匹配得到"变成"匹配到好用的"。

### Features

- **质量信号 (Quality)**: schema 新增 `quality` 块（popularity / maturity / maintained / stars / lastReviewed），打分新增独立的「质量」维度（权重 0.15）。无 `quality` 的旧条目按 `trust` 等级回落到基线分，向后兼容
- **真实精选条目 +10**: 注册表新增真实可安装的高质量 Skill/MCP——Context7、Playwright MCP、Filesystem MCP、Sequential Thinking MCP、Brave Search MCP、Anthropic PDF/Word/Excel Skill、Supabase MCP、Sentry MCP，均带真实 `sourceUrl` 与安装命令（24 → 34 条）
- **推荐展示质量 + 安装命令**: 对话/详细/JSON 三种输出都会显示「为什么值得装」（如 `官方 · 高人气 · 活跃维护 · ★15k`）和一键安装命令（无命令的市场型 Skill 显示「获取: 来源链接」）
- **`suggest` 命令（扫项目 → 荐 Skill）**: 扫描当前项目识别画像（框架 / 语言 / 是否前端 / 是否接数据库 / 是否有错误监控），推导出项目需求，再从精选库里**主动**推荐能事半功倍的高质量 Skill，每条都带「为什么这个项目需要它」。按需求逐项保证覆盖（每个检测到的需求至少一条推荐），按工具主类目归因理由
- **适配器升级成「主动触发」的 Skill Finder**: 重写 codex / codex-skill / claude / openclaw / cursor 五个适配器的触发描述——从被动的 `/agent-compass` 透传，升级为在用户问「该用/装哪个 Skill」「帮我找个工具做 X」「这项目该装啥」时**主动调用**，并都补上 `ask`（说需求）+ `suggest`（扫项目）两种模式。Codex Skill 的 `description` 控制在 120 字符内

### Fixes

- **可用性打分不再压制"待安装"的好工具**: `not_enabled` 40 → 70、`unknown` 20 → 45。一个"找 Skill"的工具不该系统性地让已装的平庸工具赢过需要装的优质工具；"不想装新的"由 `preferenceFit` 单独处理

### Tests

- 新增 8 个 `recommendForProject` 测试（项目画像、需求推导、库 vs 应用区分、覆盖与理由归因）
- 测试总数: 64 → 71，全部通过

修复全局安装后 registry 加载失败 + 中文任务分析。

### Fixes

- **Registry 路径解析**: `打包后 import.meta.dirname 指向 dist/，但路径计算用了 ../.. (假设从 src/registry/ 出发)，导致向上两层到 node_modules/ 而不是包根目录`** — 改为探测 `..` 和 `../..` 两个路径，兼容 tsx 和 tsup 打包两种场景
- **失败时报告搜索过的路径**: 不再静默返回空推荐，而是在 errors 中列出所有尝过的路径
- **中文任务分析**: 新增 regex 匹配，捕获“帮我生成个图”“帮我画个图”“帮我做张图”等中间有量词的模式
- **CATEGORY_KEYWORDS 扩展**: image_generation 新增“做个图”“做张图”“生成个图”“画个”“画一张”“生成一张图”等关键词

### Tests

- 新增 6 个中文图片生成回归测试
- 新增 4 个 registry 加载测试
- 测试总数: 55 → 64

## v0.1.3

Codex Skill Wrapper support.

### Features

- `setup codex-skill` — installs Agent Compass as a real Codex Skill
- Writes `~/.codex/skills/agent-compass/SKILL.md` + `agents/openai.yaml`
- `--force` flag to overwrite existing files (now works for all adapters)
- `--dry-run` flag to preview without writing
- Idempotent: safe to run multiple times

### Fixes

- CHANGELOG version numbering corrected
- package.json repository URLs updated to ljpman
- OpenClaw adapter writes directly to `~/.openclaw/workspace/skills/`
- `setup codex` detects existing npx instructions to avoid duplication
- All adapters support `--force` flag
- Agent name validation in setupIntegration
- Codex SKILL.md description shortened

### Docs

- Added docs/codex-skill.md
- Updated docs/openclaw-skill-wrapper.md
- Updated README with Codex Skill install instructions

## v0.1.2

Slash Adapter / Agent Wrapper support.

### Features

- `setup` command generates adapter files for Codex, Claude Code, OpenClaw, Cursor
- `setup codex` — appends Agent Compass section to AGENTS.md (idempotent)
- `setup claude` — creates .claude/commands/agent-compass.md + updates CLAUDE.md
- `setup openclaw` — creates integrations/openclaw/agent-compass/SKILL.md
- `setup cursor` — creates .cursor/rules/agent-compass.md
- `setup all` — configures all supported agents
- All adapters call `npx -y agent-compass ask "<task>"`
- Idempotent: safe to run multiple times
- Existing files are never overwritten

### Docs

- Added docs/slash-adapters.md
- Added docs/openclaw-skill-wrapper.md
- Updated README with "Use inside an AI agent" section

## v0.1.1

Agent-friendly installation patch.

### Changes

- Added `AGENTS.md` — explicit instructions for AI coding agents
- Added `docs/agent-install.md` — installation guide for agents
- Added `setup` command — create integration files for Codex, Claude Code, OpenClaw, Cursor
- Updated README with "For AI agents" section
- Updated Quick Start to use `npx -y agent-compass ask` by default
- Updated package.json description to English
- Clarified: Agent Compass is a Node.js CLI, not a Codex/OpenClaw Skill

## v0.1.0

Initial release.

### Features

- 本地技能/工具注册表（24 个内置条目）
- 自然语言任务分析
- 对话式 `/agent-compass <task>` 体验
- 最多 3 个推荐选项 + 明确建议
- 自然语言回复解析（"用第一个"、"继续"、"换一个"等）
- 偏好提取（不要安装新的、免费优先、本地优先等）
- 受控启用/安装流程
- 安全评估引擎（危险命令检测、风险分级）
- 仓库扫描（package.json 脚本、Makefile 目标、框架检测）
- 开发者 CLI（ask、scan、validate-registry、inspect、enable）
- JSON 输出模式
- 会话状态管理
- 完整测试套件（30 个测试用例）

### Documentation

- README（中英文）
- Quick Start（中英文）
- 5 个真实输入输出示例
- Demo 输出文档
- Skill/Tool Schema 文档
- 安全模型文档
- OpenClaw 集成文档
- 贡献指南
