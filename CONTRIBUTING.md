# Contributing to Agent Compass

感谢你对 Agent Compass 的兴趣！

## 开发环境

```bash
git clone https://github.com/yourname/agent-compass.git
cd agent-compass
pnpm install
```

## 常用命令

```bash
pnpm dev ask "帮我生成个图"     # 开发运行
pnpm test                       # 运行测试
pnpm typecheck                  # 类型检查
pnpm dev validate-registry      # 校验注册表
pnpm dev scan                   # 扫描仓库
```

## 添加新技能/工具

编辑 `registry/skills-tools.json`，按现有格式添加条目即可。

必填字段：`id`、`name`、`displayName`、`shortPitch`、`type`、`description`、`categories`、`tags`、`bestFor`、`avoidWhen`、`permissions`、`availability`、`trust`

添加后运行 `pnpm dev validate-registry` 确认格式正确。

## 添加测试

测试文件放在 `tests/` 目录，使用 vitest。

```bash
pnpm test
```

## 提交规范

- `feat: 新功能`
- `fix: 修复`
- `docs: 文档`
- `test: 测试`
- `refactor: 重构`
- `chore: 杂项`

## Pull Request 流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/xxx`)
3. 确保 `pnpm typecheck` 和 `pnpm test` 通过
4. 提交 PR

## License

提交代码即表示你同意以 MIT 协议发布。
