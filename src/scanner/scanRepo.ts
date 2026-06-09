import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { SkillToolManifest } from "../schema/skillTool.js";

export interface ScanResult {
  detected: SkillToolManifest[];
  framework: string | null;
  packageManager: "npm" | "pnpm" | "yarn" | null;
  scripts: Record<string, string>;
}

function detectPackageManager(cwd: string): "npm" | "pnpm" | "yarn" | null {
  if (existsSync(resolve(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(resolve(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(resolve(cwd, "package-lock.json"))) return "npm";
  if (existsSync(resolve(cwd, "package.json"))) return "npm";
  return null;
}

function detectFramework(
  cwd: string,
  deps: Record<string, string>
): string | null {
  const allDeps = { ...deps };

  if (existsSync(resolve(cwd, "next.config.js")) || existsSync(resolve(cwd, "next.config.mjs")) || allDeps["next"])
    return "nextjs";
  if (allDeps["vite"] || existsSync(resolve(cwd, "vite.config.ts")) || existsSync(resolve(cwd, "vite.config.js")))
    return "vite";
  if (allDeps["react"]) return "react";
  if (allDeps["vue"] || allDeps["@vue/cli-service"]) return "vue";
  if (allDeps["svelte"] || existsSync(resolve(cwd, "svelte.config.js"))) return "svelte";
  if (allDeps["flutter"]) return "flutter";
  if (existsSync(resolve(cwd, "requirements.txt")) || existsSync(resolve(cwd, "pyproject.toml"))) return "python";
  if (allDeps["fastapi"]) return "fastapi";

  return null;
}

export function scanRepo(cwd: string = process.cwd()): ScanResult {
  const packageJsonPath = resolve(cwd, "package.json");
  const detected: SkillToolManifest[] = [];
  let scripts: Record<string, string> = {};
  let deps: Record<string, string> = {};

  // Read package.json
  if (existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      scripts = pkg.scripts ?? {};
      deps = { ...pkg.dependencies, ...pkg.devDependencies };
    } catch {
      // ignore parse errors
    }
  }

  // Read Makefile targets
  const makefilePath = resolve(cwd, "Makefile");
  if (existsSync(makefilePath)) {
    try {
      const content = readFileSync(makefilePath, "utf-8");
      const targets = content.match(/^([a-zA-Z_-]+):/gm);
      if (targets) {
        for (const t of targets) {
          const name = t.replace(":", "").trim();
          if (name !== ".PHONY") {
            scripts[`make:${name}`] = `make ${name}`;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // Convert scripts to repo_script entries
  const scriptCategoryMap: Record<string, { categories: string[]; tags: string[]; bestFor: string[] }> = {
    build: { categories: ["coding", "deployment"], tags: ["构建", "build"], bestFor: ["构建项目", "打包"] },
    dev: { categories: ["coding"], tags: ["开发", "dev"], bestFor: ["启动开发服务器"] },
    start: { categories: ["coding"], tags: ["启动", "start"], bestFor: ["启动应用"] },
    test: { categories: ["debugging", "coding"], tags: ["测试", "test"], bestFor: ["运行测试"] },
    lint: { categories: ["coding"], tags: ["lint", "代码检查"], bestFor: ["代码检查"] },
    format: { categories: ["coding"], tags: ["格式化", "format"], bestFor: ["代码格式化"] },
    deploy: { categories: ["deployment"], tags: ["部署", "deploy"], bestFor: ["部署项目"] },
    preview: { categories: ["coding"], tags: ["预览", "preview"], bestFor: ["预览构建结果"] },
  };

  for (const [name, command] of Object.entries(scripts)) {
    const meta = scriptCategoryMap[name] ?? {
      categories: ["coding"],
      tags: [name],
      bestFor: [`运行 ${name}`],
    };

    detected.push({
      id: `repo:${name}`,
      name: `repo:${name}`,
      displayName: `项目 ${name} 脚本`,
      shortPitch: `运行 ${command}`,
      type: "repo_script",
      description: `项目中定义的 ${name} 脚本: ${command}`,
      categories: meta.categories,
      tags: meta.tags,
      bestFor: meta.bestFor,
      avoidWhen: [],
      uniqueAdvantages: ["项目已配置", "无需额外安装"],
      limitations: ["依赖项目配置"],
      examples: [`运行 ${name}`],
      inputSignals: [name, ...meta.tags],
      permissions: { runsShell: true },
      availability: { status: "available", detected: true },
      execution: {
        suggestedCommand: command,
        requiresConfirmation: false,
      },
      trust: { level: "local", source: "project" },
    });
  }

  const framework = detectFramework(cwd, deps);
  const packageManager = detectPackageManager(cwd);

  return { detected, framework, packageManager, scripts };
}
