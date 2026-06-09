# OpenClaw Integration

Agent Compass 可以作为 OpenClaw 的技能使用。

## 集成方式

### 1. 用户发送任务

```
/agent-compass 帮我生成个图
```

### 2. OpenClaw 调用 Agent Compass

OpenClaw 读取任务，调用 Agent Compass 的推荐引擎。

### 3. Agent Compass 返回推荐

Agent Compass 分析任务，返回 2-3 个简短推荐。

### 4. 用户自然语言回复

```
用第一个
```

### 5. 检查可用性和安全性

Agent Compass 检查选中的技能/工具是否已启用，评估风险。

### 6. 需要启用时请求确认

```
「图片生成」还没启用。它会调用 AI 图片生成 API。确认启用吗？
```

### 7. 用户确认后启用

```
确认
```

### 8. 启用后继续原始任务

```
已启用。现在继续帮你生成图片。
```

## 作为 OpenClaw Skill 安装

```bash
clawhub install agent-compass
```

## 配置

在 OpenClaw 的 `TOOLS.md` 中可以配置：

- 默认偏好（如 `noNewInstall: true`）
- 允许的工具来源
- 团队策略

## 扩展点

- 自定义注册表路径
- 团队允许/禁止列表
- 自定义安全策略
- 多语言支持
