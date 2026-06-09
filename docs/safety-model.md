# Safety Model

Agent Compass 内置安全评估引擎，确保不会静默执行危险操作。

## 风险等级

| 等级 | 说明 | 行为 |
|---|---|---|
| low | 低风险 | 可直接使用 |
| medium | 中风险 | 需要确认后启用 |
| high | 高风险 | 仅展示详情，需明确确认 |
| critical | 极高风险 | 阻止执行 |

## 风险因素

### 权限风险

| 权限 | 风险分 |
|---|---|
| runsShell | +2 |
| writesFiles | +1 |
| modifiesRepo | +2 |
| accessesSecrets | +3 |
| usesNetwork | +1 |
| externalService | +1 |

### 信任风险

| 信任等级 | 风险分 |
|---|---|
| official | -1 (降低) |
| verified | 0 |
| community | +1 |
| local | 0 |
| unknown | +3 |

### 危险命令检测

以下模式会被自动检测并标记为 critical：

- `curl | sh`
- `wget | sh`
- `sudo`
- `rm -rf`
- `chmod 777`
- 写入 shell 配置文件
- `eval()`
- `exec()`

## 推荐模式

| 模式 | 说明 |
|---|---|
| use_now | 可直接使用 |
| confirm_before_enable | 需确认后启用 |
| dry_run | 仅试运行 |
| explain_only | 仅展示详情 |
| blocked | 已阻止 |

## 设计原则

1. **永不静默安装** — 任何启用操作都需要用户确认
2. **最小权限** — 推荐权限最小的工具
3. **来源可信** — 优先推荐官方和经过验证的工具
4. **透明风险** — 清楚告知风险原因
5. **可回退** — 提供卸载/禁用方案
