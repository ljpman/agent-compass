import type { UserPreferences } from "../schema/skillTool.js";

export interface ParsedReply {
  action:
    | "select"
    | "confirm"
    | "reject"
    | "ask_safer"
    | "ask_no_install"
    | "ask_editable"
    | "ask_faster"
    | "ask_free"
    | "ask_details"
    | "ask_json"
    | "switch"
    | "unknown";
  value?: number; // rank selection (1-based)
  preferenceUpdate?: Partial<UserPreferences>;
}

const CN_NUM: Record<string, number> = {
  "一": 1, "二": 2, "三": 3, "四": 4, "五": 5,
  "１": 1, "２": 2, "３": 3,
};

const SELECT_PATTERNS = [
  { pattern: /^(?:用|选|就)\s*(?:第\s*)?(\d+)/, extract: true },
  { pattern: /^(?:用|选|就)\s*(?:第\s*)?([一二三四五])/, extract: true },
  { pattern: /^(\d+)$/, extract: true },
  { pattern: /^第\s*(\d+)\s*个/, extract: true },
  { pattern: /^第\s*([一二三四五])\s*个/, extract: true },
  { pattern: /^(?:first|1st|second|2nd|third|3rd)/i, extract: false },
];

const RANK_MAP: Record<string, number> = {
  first: 1, "1st": 1,
  second: 2, "2nd": 2,
  third: 3, "3rd": 3,
};

const CONFIRM_PATTERNS = [
  /继续/, /确认/, /好的/, /可以/, /行/, /ok/i, /yes/i, /继续吧/,
  /确认启用/, /开始吧/, /go/i, /continue/i, /confirm/i,
];

const REJECT_PATTERNS = [
  /不要/, /算了/, /换/, /取消/, /no/i, /cancel/i, /换一个/,
];

const DETAIL_PATTERNS = [
  /详细/, /为什么/, /展开/, /对比/, /show\s*details/i, /debug/i,
];

const JSON_PATTERNS = [/json/i, /developer\s*mode/i, /开发者模式/];

const PREF_UPDATE_PATTERNS: { pattern: RegExp; pref: keyof UserPreferences; value: boolean }[] = [
  { pattern: /不要安装|不装新的|no.*install/i, pref: "noNewInstall", value: true },
  { pattern: /安全|safe/i, pref: "preferSafe", value: true },
  { pattern: /可编辑|editable/i, pref: "preferEditable", value: true },
  { pattern: /快|fast/i, pref: "preferFast", value: true },
  { pattern: /免费|free/i, pref: "preferFree", value: true },
];

export function parseUserReply(reply: string): ParsedReply {
  const text = reply.trim();

  // Check select patterns
  for (const { pattern, extract } of SELECT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      if (extract && match[1]) {
        // Try Chinese numeral first
        if (CN_NUM[match[1]]) {
          return { action: "select", value: CN_NUM[match[1]] };
        }
        return { action: "select", value: parseInt(match[1], 10) };
      }
      // English rank words
      const lower = text.toLowerCase();
      for (const [word, rank] of Object.entries(RANK_MAP)) {
        if (lower.includes(word)) {
          return { action: "select", value: rank };
        }
      }
    }
  }

  // Check confirm
  for (const p of CONFIRM_PATTERNS) {
    if (p.test(text)) {
      return { action: "confirm" };
    }
  }

  // Check reject (but not if it contains preference signals)
  const hasPrefSignal = PREF_UPDATE_PATTERNS.some(({ pattern }) => pattern.test(text));
  if (!hasPrefSignal) {
    for (const p of REJECT_PATTERNS) {
      if (p.test(text)) {
        return { action: "reject" };
      }
    }
  }

  // Check details
  for (const p of DETAIL_PATTERNS) {
    if (p.test(text)) {
      return { action: "ask_details" };
    }
  }

  // Check JSON
  for (const p of JSON_PATTERNS) {
    if (p.test(text)) {
      return { action: "ask_json" };
    }
  }

  // Check preference updates in reply
  for (const { pattern, pref, value } of PREF_UPDATE_PATTERNS) {
    if (pattern.test(text)) {
      return {
        action: "ask_no_install",
        preferenceUpdate: { [pref]: value },
      };
    }
  }

  // Check "不要安装新" as preference update
  if (/不要安装新的/.test(text)) {
    return {
      action: "ask_no_install",
      preferenceUpdate: { noNewInstall: true },
    };
  }

  return { action: "unknown" };
}
