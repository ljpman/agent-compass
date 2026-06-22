import type { TaskAnalysis } from "../schema/skillTool.js";

export type OutputLanguage = "zh" | "en";

export function resolveLanguage(lang?: OutputLanguage | TaskAnalysis): OutputLanguage {
  if (!lang) return "zh";
  if (typeof lang === "string") return lang;
  return lang.language;
}

export const STR = {
  zh: {
    suggestLead: (name: string) => `这个我建议用「${name}」`,
    alts: "也可以选：",
    install: "装它：",
    fetch: "获取：",
    confirmTail: (rank: number) => `我建议第 ${rank} 个。继续吗？`,
    none: "没找到合适的工具。换个描述试试？",
    quality: {
      official: "官方",
      verified: "已验证",
      high: "高人气",
      medium: "口碑良好",
      maintained: "活跃维护",
      stable: "稳定",
    },
  },
  en: {
    suggestLead: (name: string) => `I'd suggest "${name}"`,
    alts: "Other options:",
    install: "Install: ",
    fetch: "Get it: ",
    confirmTail: (rank: number) => `I'd go with #${rank}. Continue?`,
    none: "No good match. Try rephrasing?",
    quality: {
      official: "official",
      verified: "verified",
      high: "popular",
      medium: "well-regarded",
      maintained: "maintained",
      stable: "stable",
    },
  },
} as const;
