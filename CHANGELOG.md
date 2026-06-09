# Changelog

## v0.1.2 (patch)

Codex Skill Wrapper support.

### Features

- `setup codex-skill` — installs Agent Compass as a real Codex Skill
- Writes `~/.codex/skills/agent-compass/SKILL.md` + `agents/openai.yaml`
- `--force` flag to overwrite existing files
- `--dry-run` flag to preview without writing
- Idempotent: safe to run multiple times

### Docs

- Added docs/codex-skill.md
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
