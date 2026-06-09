// ── Tone rules ─────────────────────────────────────────────────────
// This module enforces conversational tone rules for output.

export function assertNoTemplateLanguage(text: string): void {
  const forbidden = [
    /Based on.*analysis/i,
    /The optimal.*routing/i,
    /capability routing/i,
    /综上所述/,
    /综上/,
    /根据分析结果/,
    /推荐方案如下/,
  ];
  for (const p of forbidden) {
    if (p.test(text)) {
      throw new Error(`Template language detected: ${p.source}`);
    }
  }
}

export function truncateToLength(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 3) + "...";
}

export function isChinese(text: string): boolean {
  const zhChars = text.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  return zhChars > text.length * 0.1;
}
