import { readFileSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SkillToolManifest } from "../schema/skillTool.js";

/**
 * Resolve the directory of the current module.
 * Works in both source (tsx) and bundled (tsup) contexts.
 */
function getModuleDir(): string {
  try {
    if (typeof import.meta.url === "string") {
      return dirname(fileURLToPath(import.meta.url));
    }
  } catch {
    // fallback
  }
  return ".";
}

export interface RegistryLoadResult {
  entries: SkillToolManifest[];
  errors: string[];
}

export function loadRegistry(registryPath?: string): RegistryLoadResult {
  const errors: string[] = [];

  const modDir = getModuleDir();

  // Try provided path, then default locations
  const candidates = registryPath
    ? [registryPath]
    : [
        // cwd-based (local dev, monorepo)
        resolve(process.cwd(), "registry", "skills-tools.json"),
        resolve(process.cwd(), "skills-tools.json"),
        // module-relative: handles both dist/ (bundled) and src/registry/ (source)
        join(modDir, "..", "registry", "skills-tools.json"),
        join(modDir, "..", "..", "registry", "skills-tools.json"),
        join(modDir, "registry", "skills-tools.json"),
      ];

  let filePath: string | undefined;
  for (const p of candidates) {
    if (existsSync(p)) {
      filePath = p;
      break;
    }
  }

  if (!filePath) {
    errors.push(
      `No registry file found. Searched:\n${candidates.map((c) => `  - ${c}`).join("\n")}`
    );
    return { entries: [], errors };
  }

  try {
    const raw = readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return { entries: [], errors: ["Registry must be a JSON array"] };
    }

    const entries: SkillToolManifest[] = [];
    for (let i = 0; i < parsed.length; i++) {
      const result = SkillToolManifest.safeParse(parsed[i]);
      if (result.success) {
        entries.push(result.data);
      } else {
        errors.push(
          `Entry ${i} (${parsed[i]?.id ?? "unknown"}): ${result.error.message}`
        );
      }
    }

    return { entries, errors };
  } catch (err) {
    return {
      entries: [],
      errors: [`Failed to load registry: ${(err as Error).message}`],
    };
  }
}
