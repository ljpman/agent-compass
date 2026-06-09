# Codex Skill 安装

## CLI vs Codex Skill

| | CLI (`npx`) | Codex Skill |
|---|---|---|
| 安装方式 | `npm install -g agent-compass` | `npx -y agent-compass setup codex-skill` |
| 出现在 Codex Skills 列表 | ❌ | ✅ |
| 触发方式 | 手动运行命令 | `/agent-compass <task>` 自动触发 |
| 需要构建源码 | 否 | 否 |

**关键区别：** `npm install` 只是把 CLI 安装到 PATH，不会让 Codex 知道这是一个 Skill。要让 Codex 在 Skills 列表里发现它，需要在 `~/.codex/skills/agent-compass/` 放置 `SKILL.md`。

## 安装

```bash
npx -y agent-compass setup codex-skill
```

这会创建：

```
~/.codex/skills/agent-compass/
  SKILL.md              # Skill 定义
  agents/openai.yaml    # 可选：UI 元数据
```

## 验证

安装后运行一次验证：

```bash
npx -y agent-compass ask "帮我生成个图"
```

如果 Codex 没有立即显示，请重启或刷新 Codex。

## 使用

在 Codex 对话里直接说：

```
/agent-compass 帮我生成个图
```

Codex 会自动调用 `npx -y agent-compass ask "帮我生成个图"` 并返回推荐。

## 覆盖安装

如果文件已存在，默认跳过。使用 `--force` 覆盖：

```bash
npx -y agent-compass setup codex-skill --force
```

## 试运行

查看将要写入的文件，不实际写入：

```bash
npx -y agent-compass setup codex-skill --dry-run
```

## 卸载

```bash
rm -rf ~/.codex/skills/agent-compass
```

## 注意

- `setup codex-skill` 不会自动运行，必须用户主动执行
- 不依赖 `postinstall` 钩子
- SKILL.md 告诉 Codex：Agent Compass 是 Node.js CLI，不要 clone 仓库
