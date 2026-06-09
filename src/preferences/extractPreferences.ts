import type { UserPreferences } from "../schema/skillTool.js";

const PREF_PATTERNS: { pattern: RegExp; key: keyof UserPreferences; value: boolean }[] = [
  { pattern: /不要安装|不装|no\s*install|不要新/, key: "noNewInstall", value: true },
  { pattern: /免费|free|不花钱/, key: "preferFree", value: true },
  { pattern: /本地|local|只用当前|只用仓库|只用项目/, key: "preferLocal", value: true },
  { pattern: /最快|fast|快速|速度/, key: "preferFast", value: true },
  { pattern: /安全|safe|稳妥/, key: "preferSafe", value: true },
  { pattern: /可编辑|editable|矢量|源文件/, key: "preferEditable", value: true },
  { pattern: /官方|official|正版/, key: "preferOfficial", value: true },
  { pattern: /不联网|offline|离线/, key: "allowNetwork", value: false },
  { pattern: /可以联网|需要联网/, key: "allowNetwork", value: true },
  { pattern: /可以改仓库|允许修改/, key: "allowRepoModification", value: true },
];

export function extractPreferences(
  task: string,
  followUp?: string
): UserPreferences {
  const text = [task, followUp].filter(Boolean).join(" ");
  const prefs: UserPreferences = {};

  for (const { pattern, key, value } of PREF_PATTERNS) {
    if (pattern.test(text)) {
      (prefs as Record<string, unknown>)[key] = value;
    }
  }

  // Detect language preference
  const zhChars = text.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  if (zhChars > text.length * 0.1) {
    prefs.language = "zh";
  } else if (text.match(/[a-zA-Z]{3,}/)) {
    prefs.language = "en";
  }

  return prefs;
}

export function mergePreferences(
  base: UserPreferences,
  update: UserPreferences
): UserPreferences {
  return { ...base, ...update };
}
