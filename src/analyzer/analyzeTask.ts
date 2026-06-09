import type { TaskAnalysis, TaskCategory } from "../schema/skillTool.js";

// ── Keyword maps ───────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<TaskCategory, string[]> = {
  image_generation: ["生成图", "画", "出图", "AI绘图", "image", "draw", "generate image", "生成一张", "图片生成"],
  visual_design: ["设计", "design", "UI", "界面", "视觉", "布局"],
  social_media_design: ["小红书", "社媒", "封面", "social media", "xiaohongshu", "cover"],
  planning: ["规划", "计划", "方案", "plan", "strategy", "方向", "思路"],
  product_strategy: ["产品", "product", "MVP", "用户画像", "竞品"],
  coding: ["代码", "编程", "实现", "开发", "code", "implement", "develop", "写代码"],
  debugging: ["bug", "错误", "报错", "500", "404", "修复", "fix", "debug", "调试", "崩了"],
  data_analysis: ["分析", "数据", "统计", "analyze", "data", "洞察", "趋势"],
  spreadsheet: ["Excel", "CSV", "表格", "spreadsheet", "转化率", "渠道"],
  pdf: ["PDF", "pdf"],
  document: ["文档", "报告", "总结", "document", "report", "摘要"],
  web_research: ["调研", "搜索", "查找", "research", "search", "竞品分析"],
  browser_automation: ["浏览器", "browser", "自动化", "截图", "爬虫", "checkout", "E2E", "端到端"],
  ui_review: ["UI审查", "页面空", "布局", "可用性", "review", "感觉空"],
  content_creation: ["写", "文案", "内容", "content", "撰写"],
  short_video_script: ["短视频", "脚本", "抖音", "douyin", "script", "视频脚本"],
  platform_safety_review: ["风控", "审核", "合规", "违规", "safety", "平台规则"],
  deployment: ["部署", "上线", "发布", "deploy", "vercel", "netlify"],
  database: ["数据库", "SQL", "database", "query", "查询"],
  api_testing: ["API", "接口", "endpoint", "api测试"],
  security_review: ["安全", "漏洞", "security", "vulnerability", "OWASP"],
  performance_review: ["性能", "加载慢", "performance", "优化", "首屏"],
};

const VERB_PATTERNS = {
  zh: ["帮我", "生成", "画", "写", "做", "设计", "分析", "测试", "检查", "修", "部署", "规划", "搜索", "查", "提取", "整理"],
  en: ["help", "generate", "create", "make", "design", "analyze", "test", "check", "fix", "deploy", "plan", "search", "extract"],
};

// ── Detection helpers ──────────────────────────────────────────────

function detectLanguage(task: string): "zh" | "en" {
  const zhChars = task.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  return zhChars > task.length * 0.1 ? "zh" : "en";
}

function extractVerbs(task: string): string[] {
  const verbs: string[] = [];
  const patterns = [...VERB_PATTERNS.zh, ...VERB_PATTERNS.en];
  for (const v of patterns) {
    if (task.includes(v)) verbs.push(v);
  }
  return [...new Set(verbs)];
}

function extractObjects(task: string): string[] {
  const objects: string[] = [];
  // Simple heuristic: extract nouns after verbs
  const nounPatterns = [
    /(?:图|图片|封面|设计稿|PPT|脚本|报告|文档|PDF|Excel|API|网站|页面|代码|数据库|接口)/g,
    /(?:image|cover|design|script|report|document|PDF|Excel|API|website|page|code|database)/gi,
  ];
  for (const p of nounPatterns) {
    const matches = task.match(p);
    if (matches) objects.push(...matches);
  }
  return [...new Set(objects)];
}

function matchCategories(task: string): TaskCategory[] {
  const scores: { cat: TaskCategory; score: number }[] = [];

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (task.toLowerCase().includes(kw.toLowerCase())) {
        score += kw.length; // longer matches are more specific
      }
    }
    if (score > 0) {
      scores.push({ cat: cat as TaskCategory, score });
    }
  }

  scores.sort((a, b) => b.score - a.score);
  return scores.map((s) => s.cat);
}

function detectComplexity(task: string): "low" | "medium" | "high" {
  const highSignals = ["系统", "架构", "完整", "全流程", "端到端", "enterprise", "system", "architecture"];
  const lowSignals = ["简单", "快速", "一个", "just", "simple", "quick"];

  for (const s of highSignals) {
    if (task.includes(s)) return "high";
  }
  for (const s of lowSignals) {
    if (task.includes(s)) return "low";
  }
  return "medium";
}

// ── Main analyzer ──────────────────────────────────────────────────

export function analyzeTask(task: string): TaskAnalysis {
  const language = detectLanguage(task);
  const categories = matchCategories(task);
  const verbs = extractVerbs(task);
  const objects = extractObjects(task);
  const complexity = detectComplexity(task);

  const catSet = new Set(categories);

  return {
    originalTask: task,
    language,
    categories,
    verbs,
    objects,
    desiredOutput: objects[0],
    complexity,
    needsVisualGeneration: catSet.has("image_generation") || catSet.has("visual_design") || catSet.has("social_media_design"),
    needsDesignPlanning: catSet.has("visual_design") || catSet.has("social_media_design"),
    needsCoding: catSet.has("coding") || catSet.has("debugging"),
    needsDebugging: catSet.has("debugging"),
    needsBrowserAutomation: catSet.has("browser_automation"),
    needsDataAnalysis: catSet.has("data_analysis") || catSet.has("spreadsheet"),
    needsSpreadsheet: catSet.has("spreadsheet"),
    needsPdfDocument: catSet.has("pdf") || catSet.has("document"),
    needsWebResearch: catSet.has("web_research"),
    needsDeployment: catSet.has("deployment"),
    needsSafetyCaution: catSet.has("platform_safety_review") || catSet.has("security_review"),
  };
}
