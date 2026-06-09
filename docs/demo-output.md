# Demo 输出

以下是 Agent Compass 的真实 CLI 输出示例。

---

## 1. 图片生成

```bash
$ pnpm dev ask "帮我生成个图"
```

```
这个我建议用「图片生成」。最快出图，不用折腾。

也可以选：
1. 图片生成：可直接用
2. 小红书封面设计：可直接用
3. 网页调研：可直接用

我建议第 1 个。继续吗？
```

---

## 2. 产品规划

```bash
$ pnpm dev ask "帮我规划一个 AI 工具网站"
```

```
这个我建议用「产品规划」。先把方向定住，再动手。

也可以选：
1. 产品规划：可直接用
2. SEO 内容规划：可直接用
3. 图片生成：可直接用

我建议第 1 个。继续吗？
```

---

## 3. Excel 分析

```bash
$ pnpm dev ask "帮我分析这个 Excel 哪个渠道转化最好"
```

```
这个我建议用「表格数据分析」。直接分析 Excel，不用写代码。

也可以选：
1. 表格数据分析：可直接用
2. PDF 内容提取：可直接用
3. 图片生成：可直接用

我建议第 1 个。继续吗？
```

---

## 4. 浏览器测试

```bash
$ pnpm dev ask "帮我测试 checkout 流程"
```

```
这个我建议用「Playwright 浏览器测试」。真实浏览器环境，测 E2E 最靠谱。

也可以选：
1. Playwright 浏览器测试：未启用，可帮你启用
2. API 测试：可直接用
3. 仓库脚本执行：可直接用

我建议第 1 个。继续吗？
```

---

## 5. PDF 合同

```bash
$ pnpm dev ask "帮我把 PDF 合同整理成风险摘要"
```

```
这个我建议用「合同风险整理」。专门分析合同条款，会标注风险点。

也可以选：
1. 合同风险整理：可直接用
2. PDF 内容提取：可直接用
3. 报告撰写：可直接用

我建议第 1 个。继续吗？
```

---

## 6. JSON 开发者模式

```bash
$ pnpm dev ask "帮我生成个图" --json
```

```json
{
  "task": {
    "original": "帮我生成个图",
    "analysis": {
      "language": "zh",
      "categories": ["image_generation"],
      "complexity": "low"
    }
  },
  "recommendations": [
    {
      "rank": 1,
      "id": "image-generation",
      "displayName": "图片生成",
      "score": { "total": 85, "taskFit": 95 },
      "safety": { "riskLevel": "low", "recommendedMode": "use_now" },
      "nextAction": "use_now"
    }
  ],
  "meta": { "totalCandidates": 31, "returnedCount": 3 }
}
```

---

## 7. 仓库扫描

```bash
$ pnpm dev scan
```

```
📦 仓库扫描结果

框架: 未检测到
包管理器: pnpm
检测到脚本: 7

可用工具:
  - 项目 build 脚本: 运行 tsup
  - 项目 dev 脚本: 运行 tsx src/cli.ts
  - 项目 test 脚本: 运行 vitest run
  - 项目 lint 脚本: 运行 biome check src/ tests/
  - 项目 typecheck 脚本: 运行 tsc --noEmit
```

---

## 8. 注册表校验

```bash
$ pnpm dev validate-registry
```

```
✅ 注册表有效: 24/24 条目通过校验
```
