/**
 * Research ("研究") helpers.
 *
 * Research entries live in `src/content/research/<kind>/<slug>.md` where
 * `<kind>` is one of the sub-module directories below. Like projects they
 * are Chinese-only and filesystem-routed at `/research/<kind>/<slug>/`.
 */

import { getCollection, type CollectionEntry } from 'astro:content';
import katex from 'katex';

import type { Locale } from '../config';
import { localizedPath } from '../i18n/utils';

export type ResearchEntry = CollectionEntry<'research'>;

/**
 * 子模块（= 子目录名），按站内展示顺序排列：先补经典、再追每周。
 * 范围约定：只收上半身——机械臂/双臂、灵巧手、上半身操作及相关的
 * 运动学/动力学/控制与 VLA/IL/RL；locomotion、四旋翼、以移动底盘为
 * 核心的工作不收录（除非其核心方法可直接迁移到机械臂/操作）。
 * repro / trends 预留，暂无内容。
 */
export const RESEARCH_KINDS = ['classics', 'radar', 'deepdive', 'repro', 'trends'] as const;
export type ResearchKind = (typeof RESEARCH_KINDS)[number];

export const RESEARCH_KIND_META: Record<ResearchKind, { label: string; icon: string }> = {
  classics: { label: '经典选读', icon: 'lucide:library' },
  radar: { label: '每周论文雷达', icon: 'lucide:radar' },
  deepdive: { label: '论文精读', icon: 'lucide:microscope' },
  repro: { label: '复现记录', icon: 'lucide:flask-conical' },
  trends: { label: '趋势观察', icon: 'lucide:trending-up' },
};

/** 审读状态 → 页面横幅文案与样式（区分 AI 分析 / 本人审读）。 */
export const RESEARCH_STATUS_META = {
  'ai-draft': {
    label: 'AI 分析草稿',
    detail: '本文由 AI 辅助生成，尚未经本人逐句审读；分析与数字转述可能有误，请以论文原文为准。',
    tone: 'warning',
  },
  'in-review': {
    label: '审读中',
    detail: '本人正在审读校对，部分章节已核对，其余内容请以论文原文为准。',
    tone: 'info',
  },
  reviewed: {
    label: '已审读',
    detail: '本文已经本人全文审读校对。',
    tone: 'success',
  },
} as const;

/** 从条目 id（如 `radar/2026-w43`）推导子模块类型。 */
export function researchKind(entry: ResearchEntry): ResearchKind {
  const seg = entry.id.split(/[\\/]/)[0];
  if ((RESEARCH_KINDS as readonly string[]).includes(seg)) return seg as ResearchKind;
  throw new Error(
    `Research entry "${entry.id}" is not under a known sub-module directory ` +
      `(${RESEARCH_KINDS.join(', ')}).`,
  );
}

/** 全部已发布的研究条目，按置顶 + 时间倒序。 */
export async function getResearchEntries(kind?: ResearchKind): Promise<ResearchEntry[]> {
  const all = await getCollection('research', (entry) => {
    if (import.meta.env.PROD && entry.data.draft) return false;
    return kind ? entry.id.split(/[\\/]/)[0] === kind : true;
  });
  return all.sort((a, b) => {
    if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
    return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
  });
}

/** URL slug：`radar/2026-w43` 这样的 id 原样作为路径。 */
export function researchSlug(entry: ResearchEntry): string {
  return entry.id.replace(/\.(md|mdx)$/i, '');
}

/** 研究条目详情页路径。 */
export function researchPath(entry: ResearchEntry, locale: Locale): string {
  return localizedPath(`/research/${researchSlug(entry)}/`, locale);
}

/** 研究首页路径。 */
export function researchIndexPath(locale: Locale): string {
  return localizedPath('/research/', locale);
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * 构建期渲染 frontmatter 字符串中的 `$...$` / `$$...$$` 公式。
 *
 * 论文卡片的「关键机制」等字段存放在 frontmatter 里，不经过 Markdown
 * remark 管线，因此这里直接用 KaTeX 在构建期渲染成 HTML（页面需配合
 * `math: true` 加载 KaTeX 样式表）。非公式部分会做 HTML 转义。
 */
export function renderMathInline(text: string): string {
  // 先匹配 $$...$$（display），再匹配 $...$（inline）。
  const pattern = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  let out = '';
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    out += escapeHtml(text.slice(last, m.index));
    const [, display, inline] = m;
    try {
      out += katex.renderToString(display ?? inline, {
        displayMode: display !== undefined,
        throwOnError: true,
      });
    } catch {
      out += escapeHtml(m[0]);
    }
    last = m.index + m[0].length;
  }
  out += escapeHtml(text.slice(last));
  return out;
}
