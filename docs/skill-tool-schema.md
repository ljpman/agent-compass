# Skill / Tool Schema

Agent Compass 使用 JSON Schema 定义技能/工具的元数据。

## 字段说明

### 基本信息

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | ✅ | 唯一标识符 |
| name | string | ✅ | 内部名称 |
| displayName | string | ✅ | 用户可见的显示名称 |
| shortPitch | string | ✅ | 一句话简介 |
| type | enum | ✅ | 类型：skill / plugin / mcp / cli / repo_script / built_in / workflow |
| description | string | ✅ | 详细描述 |

### 分类和标签

| 字段 | 类型 | 说明 |
|---|---|---|
| categories | string[] | 所属分类 |
| tags | string[] | 搜索标签 |

### 匹配信息

| 字段 | 类型 | 说明 |
|---|---|---|
| bestFor | string[] | 最适合的场景 |
| avoidWhen | string[] | 应避免的场景 |
| uniqueAdvantages | string[] | 独特优势 |
| limitations | string[] | 局限性 |
| examples | string[] | 使用示例 |
| inputSignals | string[] | 触发关键词 |

### 权限

```json
{
  "permissions": {
    "readsFiles": true,
    "writesFiles": false,
    "runsShell": false,
    "usesNetwork": true,
    "accessesSecrets": false,
    "modifiesRepo": false,
    "externalService": false
  }
}
```

### 可用性

```json
{
  "availability": {
    "status": "available | not_enabled | unknown",
    "detected": true
  }
}
```

### 启用配置

```json
{
  "enablement": {
    "required": true,
    "method": "npm | pnpm | pip | brew | git | manual | mcp_config | auth",
    "command": "npm install -g tool",
    "verifyCommand": "tool --version",
    "sourceUrl": "https://github.com/...",
    "notes": "需要配置 API key",
    "verified": true
  }
}
```

### 信任等级

| 等级 | 说明 |
|---|---|
| official | 官方维护 |
| verified | 经过验证 |
| community | 社区贡献 |
| local | 本地/项目内 |
| unknown | 来源未知 |

---

## 完整示例

```json
{
  "id": "playwright-testing",
  "name": "playwright-testing",
  "displayName": "Playwright 浏览器测试",
  "shortPitch": "用真实浏览器自动化测试网页",
  "type": "cli",
  "description": "Playwright 浏览器自动化测试工具",
  "categories": ["browser_automation", "api_testing"],
  "tags": ["浏览器", "测试", "E2E"],
  "bestFor": ["浏览器测试", "E2E测试"],
  "avoidWhen": ["不需要真实浏览器"],
  "uniqueAdvantages": ["真实浏览器环境", "支持多浏览器"],
  "limitations": ["需要安装浏览器依赖"],
  "examples": ["测试 checkout 流程"],
  "inputSignals": ["浏览器测试", "E2E", "playwright"],
  "permissions": {
    "runsShell": true,
    "writesFiles": true,
    "modifiesRepo": true
  },
  "availability": { "status": "not_enabled" },
  "enablement": {
    "required": true,
    "method": "npm",
    "command": "npx playwright install && npm i -D @playwright/test",
    "verifyCommand": "npx playwright --version",
    "sourceUrl": "https://github.com/microsoft/playwright",
    "notes": "会下载浏览器依赖",
    "verified": true
  },
  "execution": { "requiresConfirmation": true },
  "trust": { "level": "official", "source": "microsoft" }
}
```
