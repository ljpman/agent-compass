import { readFileSync } from "node:fs";
import { SkillToolManifest } from "../schema/skillTool.js";

export interface ValidationResult {
  valid: boolean;
  totalEntries: number;
  validEntries: number;
  errors: { index: number; id: string; message: string }[];
}

export function validateRegistry(filePath: string): ValidationResult {
  const raw = readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    return {
      valid: false,
      totalEntries: 0,
      validEntries: 0,
      errors: [{ index: -1, id: "root", message: "Registry must be a JSON array" }],
    };
  }

  const errors: { index: number; id: string; message: string }[] = [];
  let validEntries = 0;

  for (let i = 0; i < parsed.length; i++) {
    const result = SkillToolManifest.safeParse(parsed[i]);
    if (result.success) {
      validEntries++;
    } else {
      errors.push({
        index: i,
        id: parsed[i]?.id ?? "unknown",
        message: result.error.message,
      });
    }
  }

  return {
    valid: errors.length === 0,
    totalEntries: parsed.length,
    validEntries,
    errors,
  };
}
