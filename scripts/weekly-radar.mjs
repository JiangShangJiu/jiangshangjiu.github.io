#!/usr/bin/env node
/**
 * Weekly Paper Radar generator.
 *
 * 面向「上半身」范围：机械臂/双臂、灵巧手、操作及相关 VLA/IL/RL。
 * 从 arXiv API（export.arxiv.org）抓取近一周论文、按排除词过滤掉
 * locomotion/四旋翼/移动底盘类工作，写出 DRAFT 雷达条目到
 * `src/content/research/radar/<year>-w<week>.md`。
 *
 * 由 `.github/workflows/weekly-radar.yml` 调用并开 PR——绝不自动合并；
 * 脚本失败（网络错误 / 零结果）则 job 失败、不开 PR，站点保留上一期
 * 的正常内容。
 *
 * Usage:
 *   node scripts/weekly-radar.mjs            # 写出 markdown 条目
 *   node scripts/weekly-radar.mjs --json     # 打印抓取结果 JSON（调试）
 *   DAYS=14 MAX_PAPERS=10 node scripts/weekly-radar.mjs
 *
 * TODO(automation):
 *  - 接入 LLM 基于摘要预填 problem/method 等技术字段（当前写入占位文
 *    案，由人在 review PR 时补全；schema 要求这些字段非空）。
 *  - GitHub 工程雷达：当前只输出空的 repos 列表 + TODO 注释。计划用
 *    GitHub API 跟踪固定仓库清单（ros2_control / moveit2 / pinocchio /
 *    mujoco / lerobot / IsaacLab 等）的最新 release 与合入记录。
 *  - 更聪明的排序/过滤：当前只按提交时间取最新 + 关键词排除；可加
 *    作者机构、与站内主题的相关度等信号。被排除词误伤的可迁移工作
 *    （如以操作为核心的移动操作）需人工捞回。
 *  - 与历史雷达条目去重（同一篇论文的 v2/v3 更新不重复收录）。
 */

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RADAR_DIR = join(ROOT, 'src/content/research/radar');

/** 主题 → arXiv 检索式（上半身范围）。topic 写进每篇论文的 `topics`。 */
const QUERIES = [
  { topic: 'VLA', query: 'all:"vision-language-action"' },
  { topic: '扩散/流匹配策略', query: 'all:"diffusion policy" OR all:"flow matching policy"' },
  { topic: '模仿学习', query: 'cat:cs.RO AND all:"imitation learning"' },
  { topic: '双臂/灵巧手', query: 'cat:cs.RO AND (all:"bimanual" OR all:"dexterous")' },
  { topic: '操作', query: 'cat:cs.RO AND all:"manipulation"' },
  {
    topic: '强化学习（操作）',
    query: 'cat:cs.RO AND all:"reinforcement learning" AND all:"manipulation"',
  },
  { topic: '世界模型（操作）', query: 'cat:cs.RO AND all:"world model" AND all:"manipulation"' },
];

/**
 * 范围外关键词（标题+摘要匹配即剔除）：locomotion、四旋翼/无人机、
 * 自动驾驶等。注意这是粗过滤，可迁移到机械臂/操作的工作可能被误伤，
 * 需在 review PR 时人工捞回。
 */
const EXCLUDE =
  /\b(locomotion|legged|quadruped|bipedal|gait|quadrotor|uav|drone|aerial|autonomous driving|self-driving)\b/i;

const DAYS = Number(process.env.DAYS ?? 7);
const MAX_PAPERS = Number(process.env.MAX_PAPERS ?? 8);
const PER_QUERY = 15;

/** Minimal Atom parsing (arXiv's feed is regular enough; avoids an XML dep). */
function textBetween(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].trim() : undefined;
}

function decodeEntities(s) {
  return s
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&');
}

function parseEntry(xml) {
  const idUrl = textBetween(xml, 'id') ?? '';
  // http://arxiv.org/abs/2610.31670v1 -> 2610.31670
  const idMatch = idUrl.match(/abs\/([\w.\-/]+?)(v\d+)?$/);
  const arxivId = idMatch ? idMatch[1] : undefined;
  const title = decodeEntities((textBetween(xml, 'title') ?? '').replace(/\s+/g, ' '));
  const summary = decodeEntities((textBetween(xml, 'summary') ?? '').replace(/\s+/g, ' '));
  const published = textBetween(xml, 'published');
  const authors = [...xml.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>/g)].map((m) =>
    decodeEntities(m[1].trim()),
  );
  const categories = [...xml.matchAll(/<category[^>]*term="([^"]+)"/g)].map((m) => m[1]);
  return { arxivId, title, summary, published, authors, categories };
}

async function fetchQuery({ topic, query }) {
  const url =
    'https://export.arxiv.org/api/query?search_query=' +
    encodeURIComponent(query) +
    `&sortBy=submittedDate&sortOrder=descending&max_results=${PER_QUERY}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'jiangshangjiu-weekly-radar/1.0' } });
  if (!res.ok) throw new Error(`arXiv query failed (${res.status}) for topic ${topic}`);
  const xml = await res.text();
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => parseEntry(m[1]));
  for (const e of entries) e.topics = [topic];
  return entries;
}

function isoWeek(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

/** JSON string doubles as a safe single-line YAML scalar. */
const y = (s) => JSON.stringify(s);

/** schema 要求技术字段非空；自动生成阶段写占位文案，review 时人工补全。 */
const PENDING = '（待人工补充：自动抓取阶段未填写，见摘要与原文。）';

function renderMarkdown(papers, now) {
  const { year, week } = isoWeek(now);
  const date = now.toISOString().slice(0, 10);
  const lines = [];
  lines.push('---');
  lines.push(`title: ${y(`论文雷达 ${year}-W${String(week).padStart(2, '0')}：上半身操作与 VLA`)}`);
  lines.push(
    `description: ${y(`本周上半身机器人学习论文速览（${date} 自动抓取自 arXiv，待人工筛选与点评）。`)}`,
  );
  lines.push(`pubDate: ${date}T08:00:00+08:00`);
  lines.push('tags:');
  for (const t of [...new Set(papers.flatMap((p) => p.topics))]) lines.push(`  - ${y(t)}`);
  lines.push('categories:');
  lines.push('  - "论文研究"');
  // 自动生成的条目默认 draft：生产构建会隐藏它，直到人工 review 后在
  // PR 里改为 false。
  lines.push('draft: true');
  lines.push('status: "ai-draft"');
  lines.push('papers:');
  for (const p of papers) {
    lines.push(`  - title: ${y(p.title)}`);
    lines.push('    authors:');
    for (const a of p.authors) lines.push(`      - ${y(a)}`);
    if (p.arxivId) lines.push(`    arxivId: ${y(p.arxivId)}`);
    if (p.published) lines.push(`    published: ${y(p.published.slice(0, 10))}`);
    if (p.categories.length) {
      lines.push('    categories:');
      for (const c of p.categories.slice(0, 4)) lines.push(`      - ${y(c)}`);
    }
    lines.push('    topics:');
    for (const t of p.topics) lines.push(`      - ${y(t)}`);
    lines.push('    links:');
    lines.push(`      abs: ${y(`https://arxiv.org/abs/${p.arxivId}`)}`);
    lines.push(`      pdf: ${y(`https://arxiv.org/pdf/${p.arxivId}`)}`);
    // TODO(automation): project/code 链接须人工从论文摘要/正文核实后
    // 添加，脚本不猜测 URL。技术字段由 LLM 或人工基于摘要补全。
    lines.push(`    problem: ${y(PENDING)}`);
    lines.push(`    motivation: ${y(PENDING)}`);
    lines.push(`    method: ${y(PENDING)}`);
    lines.push(`    experiments: ${y(PENDING)}`);
    lines.push(`    limitations: ${y(PENDING)}`);
    lines.push(`    recommendation: ${y(PENDING)}`);
  }
  // TODO(automation): GitHub 工程雷达——用 GitHub API 跟踪固定仓库清单
  // 的 release/合入动态后填充；当前留空由人工补充。
  lines.push('repos: []');
  lines.push('---');
  lines.push('');
  lines.push('```alert');
  lines.push('type: warning');
  lines.push('icon: lucide:shield-alert');
  lines.push('title: 自动生成草稿');
  lines.push(
    '本条目由每周自动化抓取生成：论文元数据与链接来自 arXiv API，技术字段为占位文案；发布前需人工筛选论文、补全点评并核对链接。',
  );
  lines.push('```');
  lines.push('');
  lines.push('## 本期导读');
  lines.push('');
  lines.push('（待人工撰写：本周主线、值得对照阅读的论文组合。）');
  lines.push('');
  return { filename: `${year}-w${String(week).padStart(2, '0')}.md`, content: lines.join('\n') };
}

async function main() {
  const now = new Date();
  const cutoff = now.getTime() - DAYS * 86400000;

  const results = await Promise.all(QUERIES.map(fetchQuery));
  const byId = new Map();
  let excluded = 0;
  for (const entries of results) {
    for (const e of entries) {
      if (!e.arxivId || !e.published) continue;
      if (new Date(e.published).getTime() < cutoff) continue;
      if (EXCLUDE.test(`${e.title} ${e.summary}`)) {
        excluded++;
        continue;
      }
      const prev = byId.get(e.arxivId);
      if (prev) prev.topics = [...new Set([...prev.topics, ...e.topics])];
      else byId.set(e.arxivId, e);
    }
  }
  const papers = [...byId.values()]
    .sort((a, b) => new Date(b.published) - new Date(a.published))
    .slice(0, MAX_PAPERS);

  console.error(`Fetched ${byId.size} unique papers (${excluded} excluded by scope filter).`);
  if (papers.length === 0) {
    console.error(`No papers found in the last ${DAYS} days — refusing to write an empty radar.`);
    process.exit(1);
  }

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(papers, null, 2));
    return;
  }

  const { filename, content } = renderMarkdown(papers, now);
  const path = join(RADAR_DIR, filename);
  if (existsSync(path) && !process.argv.includes('--force')) {
    console.error(`${path} already exists; use --force to overwrite.`);
    process.exit(1);
  }
  mkdirSync(RADAR_DIR, { recursive: true });
  writeFileSync(path, content);
  console.log(`Wrote ${papers.length} papers to ${path}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
