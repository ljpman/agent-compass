import { Command } from "commander";
import { askAgentCompass } from "./router/askAgentCompass.js";
import { loadRegistry } from "./registry/loadRegistry.js";
import { validateRegistry } from "./registry/validateRegistry.js";
import { scanRepo } from "./scanner/scanRepo.js";
import { recommendForProject } from "./scanner/recommendForProject.js";
import { formatConversational } from "./output/formatConversational.js";
import { formatDetailed } from "./output/formatDetailed.js";
import { formatDeveloperJson } from "./output/formatDeveloperJson.js";
import { formatProjectSuggestions } from "./output/formatProjectSuggestions.js";
import { handleReply } from "./session/handleReply.js";
import { clearState, loadState, saveState } from "./session/sessionState.js";
import { setupIntegration, VALID_AGENTS } from "./setup/setupIntegration.js";

const program = new Command();

program
  .name("agent-compass")
  .description("帮 AI Agent 为每个任务找到最合适的技能")
  .version("0.1.4");

// ── ask command ────────────────────────────────────────────────────
program
  .command("ask")
  .description("根据自然语言任务推荐最合适的技能/工具")
  .argument("<task>", "自然语言任务描述")
  .option("--json", "输出 JSON 格式（开发者模式）")
  .option("--detail", "输出详细对比")
  .action((task: string, options: { json?: boolean; detail?: boolean }) => {
    const result = askAgentCompass(task);

    if (options.json) {
      const total = loadRegistry().entries.length + scanRepo().detected.length;
      const devOutput = formatDeveloperJson(
        result.recommendations,
        result.analysis,
        result.preferences,
        total
      );
      console.log(JSON.stringify(devOutput, null, 2));
      return;
    }

    if (options.detail) {
      console.log(formatDetailed(result.recommendations, result.analysis));
      return;
    }

    console.log(formatConversational(result.recommendations, task, result.analysis.language));

    // Save state for conversational flow
    saveState(result.state);
  });

// ── reply command ──────────────────────────────────────────────────
program
  .command("reply")
  .description("在 ask 之后，用自然语言回复推进会话（选择/确认/换一个/详情）")
  .argument("<reply>", "用户的自然语言回复")
  .option("--execute", "确认启用时真正执行命令（默认仅试运行）", false)
  .action((reply: string, options: { execute?: boolean }) => {
    const result = handleReply(loadState(), reply, options);
    console.log(result.message);

    if (result.clear) {
      clearState();
      return;
    }

    if (result.state) {
      saveState(result.state);
    }
  });

// ── scan command ───────────────────────────────────────────────────
program
  .command("scan")
  .description("扫描当前仓库，检测可用的脚本和工具")
  .action(() => {
    const result = scanRepo();

    console.log(`\n📦 仓库扫描结果\n`);
    console.log(`框架: ${result.framework ?? "未检测到"}`);
    console.log(`包管理器: ${result.packageManager ?? "未检测到"}`);
    console.log(`检测到脚本: ${Object.keys(result.scripts).length}`);

    if (result.detected.length > 0) {
      console.log(`\n可用工具:`);
      for (const entry of result.detected) {
        console.log(`  - ${entry.displayName}: ${entry.shortPitch}`);
      }
    }

    if (Object.keys(result.scripts).length > 0) {
      console.log(`\n脚本:`);
      for (const [name, cmd] of Object.entries(result.scripts)) {
        console.log(`  - ${name}: ${cmd}`);
      }
    }
  });

// ── suggest command (scan project → recommend skills) ──────────────
program
  .command("suggest")
  .description("扫描当前项目，主动推荐能帮上忙的高质量 Skill")
  .option("--json", "输出 JSON 格式（开发者模式）")
  .action((options: { json?: boolean }) => {
    const result = recommendForProject();

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log(formatProjectSuggestions(result));
  });

// ── validate-registry command ──────────────────────────────────────
program
  .command("validate-registry")
  .description("校验注册表文件")
  .argument("[path]", "注册表文件路径", "registry/skills-tools.json")
  .action((path: string) => {
    const result = validateRegistry(path);

    if (result.valid) {
      console.log(`✅ 注册表有效: ${result.validEntries}/${result.totalEntries} 条目通过校验`);
    } else {
      console.log(`❌ 注册表校验失败: ${result.errors.length} 个错误`);
      for (const err of result.errors) {
        console.log(`  [${err.index}] ${err.id}: ${err.message}`);
      }
      process.exit(1);
    }
  });

// ── inspect command ────────────────────────────────────────────────
program
  .command("inspect")
  .description("查看指定技能/工具的详细信息")
  .argument("<id>", "技能/工具 ID")
  .action((id: string) => {
    const { entries } = loadRegistry();
    const entry = entries.find((e) => e.id === id);

    if (!entry) {
      console.log(`未找到: ${id}`);
      process.exit(1);
    }

    console.log(JSON.stringify(entry, null, 2));
  });

// ── enable command (dry-run by default) ────────────────────────────
program
  .command("enable")
  .description("启用指定技能/工具（试运行）")
  .argument("<id>", "技能/工具 ID")
  .option("--dry-run", "仅显示命令，不实际执行", true)
  .action((id: string, options: { dryRun?: boolean }) => {
    const { entries } = loadRegistry();
    const entry = entries.find((e) => e.id === id);

    if (!entry) {
      console.log(`未找到: ${id}`);
      process.exit(1);
    }

    if (!entry.enablement?.command) {
      console.log(`「${entry.displayName}」无需额外启用`);
      return;
    }

    if (options.dryRun !== false) {
      console.log(`[试运行] 将执行: ${entry.enablement.command}`);
      if (entry.enablement.notes) {
        console.log(`注意: ${entry.enablement.notes}`);
      }
    }
  });

// ── setup command ──────────────────────────────────────────────────
program
  .command("setup")
  .description("为 AI agent 创建集成配置文件")
  .argument("<agent>", "目标 agent: codex, codex-skill, claude, openclaw, cursor, all")
  .option("--force", "覆盖已存在的文件")
  .option("--dry-run", "仅显示将要写入的文件，不实际写入")
  .action((agent: string, options: { force?: boolean; dryRun?: boolean }) => {
    if (!VALID_AGENTS.includes(agent as any)) {
      console.log(`未知 agent: ${agent}`);
      console.log(`支持: ${VALID_AGENTS.join(", ")}`);
      process.exit(1);
    }
    setupIntegration(agent, options);
  });

program.parse();
