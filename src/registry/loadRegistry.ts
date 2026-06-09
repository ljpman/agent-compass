import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { SkillToolManifest } from "../schema/skillTool.js";

export interface RegistryLoadResult {
  entries: SkillToolManifest[];
  errors: string[];
}

export function loadRegistry(registryPath?: string): RegistryLoadResult {
  const errors: string[] = [];

  // Try provided path, then default locations
  const candidates = registryPath
    ? [registryPath]
    : [
        resolve(process.cwd(), "registry", "skills-tools.json"),
        resolve(process.cwd(), "skills-tools.json"),
        join(import.meta.dirname ?? ".", "..", "..", "registry", "skills-tools.json"),
      ];

  let filePath: string | undefined;
  for (const p of candidates) {
    if (existsSync(p)) {
      filePath = p;
      break;
    }
  }

  if (!filePath) {
    return { entries: [], errors: ["No registry file found"] };
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
