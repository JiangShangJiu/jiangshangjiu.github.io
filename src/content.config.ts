/**
 * Content Collections (Astro v7 loader API).
 *
 * Folder convention: `src/content/<collection>/<locale>/**`
 *  - posts/en/**  -> EN posts
 *  - posts/fr/**  -> FR posts
 *  - pages/en/**  -> EN static pages (about, etc.)
 *  - pages/fr/**  -> FR static pages
 *
 * The locale is derived from the file path so authors do not need to set it
 * manually (but they may override it in frontmatter).
 */

import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'zod';

import { SITE } from './config';

const localeEnum = z.enum(SITE.locales as unknown as [string, ...string[]]);

/**
 * Build the post / page frontmatter schema.
 *
 * `heroImage` is a plain string path. On THIS site every content image
 * lives in `public/assets/img/**` and is referenced with an absolute
 * `/assets/img/...` URL — the same convention the Markdown bodies use
 * (see `scripts/sync_robot_model_figures.py`). That keeps the paths
 * byte-for-byte identical to the previous Jekyll site.
 *
 * The upstream theme used `image()` here so a path relative to the
 * Markdown file (into `src/assets/...`) would go through Astro's image
 * pipeline. That helper **throws** `ImageNotFound` on an absolute
 * `/assets/...` path, so it is deliberately not used. If you ever want
 * Astro's optimiser for a hero image, import the file in a component and
 * pass the `ImageMetadata` to `<SmartImage>` directly.
 */
const baseFrontmatter = () =>
  z.object({
    title: z.string().min(1).max(140),
    description: z.string().min(1).max(280),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /** Path to the hero/featured image, e.g. `/assets/img/foo/cover.webp`. */
    heroImage: z.string().optional(),
    /** Optional alt-text for the hero/featured image. */
    heroImageAlt: z.string().optional(),
    /** Per-post override of SITE.showFeaturedImages (cards + hero). */
    showFeaturedImage: z.boolean().optional(),
    /** Per-post override of SITE.dynamicPostCardHeight on listing cards. */
    dynamicPostCardHeight: z.boolean().optional(),
    canonicalURL: z.url().optional(),
    comments: z.boolean().optional(),
    toc: z.boolean().default(true),
    /** Pin to top of listings. */
    pinned: z.boolean().default(false),
    /**
     * Opt in to LaTeX math rendering (KaTeX). When `true`, the layout
     * loads `katex.min.css` only on this page so the stylesheet stays
     * off posts/pages that don't use math.
     */
    math: z.boolean().default(false),
    /**
     * Opt in to Mermaid diagram rendering. When `true`, the layout
     * loads the Mermaid client library and initializes diagrams.
     * Defaults to `false` to keep the heavy Mermaid library off posts/pages
     * that don't use it.
     */
    mermaid: z.boolean().default(false),
    /** Optional locale override; otherwise inferred from path. */
    lang: localeEnum.optional(),
    /**
     * Maps translated variants together. Posts that share a translationKey
     * across locales are considered translations of each other and the
     * language switcher will jump between them on the same article.
     *
     * If omitted, falls back to the file slug (relative to the locale folder).
     */
    translationKey: z.string().optional(),
    /**
     * Unlisted posts/pages are NOT shown in any listing (home, archives,
     * tags, categories, RSS, sitemap) but remain accessible to anyone who
     * knows the direct URL.
     *
     * Use `unlistedHideFromSeo: true` (the default when `unlisted: true`)
     * to also emit `<meta name="robots" content="noindex, nofollow">` so
     * search engines won't index or follow links on the page.
     */
    unlisted: z.boolean().default(false),
    /**
     * When `true`, adds `<meta name="robots" content="noindex, nofollow">`
     * to the page. Defaults to `true` whenever `unlisted: true`; can be
     * set independently to hide a listed post from search engines, or to
     * keep an unlisted post indexable (e.g. for sharing via a canonical URL
     * you control).
     */
    unlistedHideFromSeo: z.boolean().optional(),
  });

export type PostFrontmatter = z.infer<ReturnType<typeof baseFrontmatter>>;

/**
 * Preserve the on-disk filename verbatim as the content id.
 *
 * Astro's default id generator lowercases and "slugifies" the path, which
 * would rewrite `/posts/TOPP-RA-原理解析/` into `/posts/topp-ra-原理解析/`
 * and break every URL inherited from the previous Jekyll site.
 *
 * Returning the path relative to `base` (minus the extension) keeps the id
 * byte-for-byte identical to the filename, so `/posts/<filename>/` matches
 * the old Jekyll `permalink: /posts/:title/` output exactly.
 */
function preserveFilename({ entry }: { entry: string }): string {
  return entry.replace(/\.(md|mdx)$/i, '');
}

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/posts',
    generateId: preserveFilename,
  }),
  schema: baseFrontmatter,
});

const pages = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/pages',
    generateId: preserveFilename,
  }),
  schema: () =>
    baseFrontmatter()
      .partial({ pubDate: true })
      .extend({
        /** Pages don't paginate or appear in archives. */
        showInNav: z.boolean().default(false),
      }),
});

/**
 * Projects ("成果") — a custom collection ported from the previous Jekyll
 * site's `_projects/` directory.
 *
 * Not localized: projects are filesystem-routed at `/projects/<filename>/`
 * and every entry is written in Chinese.
 *
 * `heroImage`, `tags` and `description` are reused from the shared base
 * schema so the same tooling (SEO, tags, cards) keeps working.
 */
const projects = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/projects',
    generateId: preserveFilename,
  }),
  schema: () =>
    baseFrontmatter()
      .partial({ pubDate: true, description: true })
      .extend({
        /** One-line pitch shown under the title on the detail page. */
        subtitle: z.string().optional(),
        /**
         * Featured figures for the homepage 成果展示 section — normally the
         * project's *results* (e.g. model-predicted vs. measured torque, and
         * the recovered inertial parameters), which are the actual deliverable.
         *
         * Kept separate from `heroImage` on purpose: `heroImage` is a wide
         * banner cropped to 2.4:1 by the listing cards, whereas result figures
         * are often tall multi-panel plots that must NOT be cropped.
         * Falls back to `heroImage` when this list is empty.
         *
         * Rendered in order; the first one is the headline figure.
         */
        resultFigures: z
          .array(
            z.object({
              /** Absolute public path, e.g. `/assets/img/projects/x/plot.webp`. */
              src: z.string(),
              /** Alt text; falls back to the project title. */
              alt: z.string().optional(),
              /** Visible caption shown under the figure. */
              caption: z.string().optional(),
            }),
          )
          .default([]),
        /**
         * Looping demo clip shown as the headline visual on the homepage 成果
         * card — autoplayed, muted and looping, i.e. a "video GIF". Kept
         * separate from `heroImage`/`resultFigures` because it is a short,
         * silent clip (`public/assets/videos/<slug>/loop.mp4`) rather than a
         * still image. When present it replaces the still figures on the card.
         */
        featureVideo: z
          .object({
            /** Absolute public path, e.g. `/assets/videos/energy-tank/loop.mp4`. */
            src: z.string(),
            /** Poster frame shown before the clip starts. */
            poster: z.string().optional(),
            /** Native video ratio, e.g. "12 / 11" for the IK four-panel clip. */
            aspectRatio: z
              .string()
              .regex(/^[1-9]\d*\s*\/\s*[1-9]\d*$/)
              .default('16 / 9'),
            /** Visible caption shown under the clip. */
            caption: z.string().optional(),
          })
          .optional(),
        /** Optional set of looping previews for homepage and listing cards. */
        previewVideos: z
          .array(
            z.object({
              src: z.string(),
              poster: z.string().optional(),
              title: z.string().optional(),
              caption: z.string().optional(),
              aspectRatio: z
                .string()
                .regex(/^[1-9]\d*\s*\/\s*[1-9]\d*$/)
                .default('16 / 9'),
            }),
          )
          .default([]),
        /** Lower numbers sort first in listings. */
        order: z.number().default(999),
        /** Short "what I did" line. */
        role: z.string().optional(),
        /** Free-text period, e.g. "2026.09 起，持续维护". */
        period: z.string().optional(),
        /** Free-text status, e.g. "已开源". */
        status: z.string().optional(),
        /** Tech stack chips. */
        stack: z.array(z.string()).default([]),
        /** Headline metrics rendered as chips on cards. */
        metrics: z.array(z.string()).default([]),
        /** Big number cards at the top of the detail page. */
        highlights: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
        /** Call-to-action buttons. */
        buttons: z
          .array(
            z.object({
              label: z.string(),
              url: z.string(),
              icon: z.string().optional(),
              primary: z.boolean().default(false),
              external: z.boolean().default(false),
            }),
          )
          .default([]),
      }),
});

/**
 * Research ("研究") — 持续的论文研究与发布系统。
 *
 * 范围：只收上半身——机械臂/双臂、灵巧手、上半身操作及相关的运动学/
 * 动力学/控制与 VLA/IL/RL；locomotion、四旋翼、移动底盘为核心的工作
 * 不收录（除非核心方法可直接迁移到机械臂/操作）。
 *
 * 子目录即条目类型（与 posts 用路径推导 locale 的做法一致）：
 *   research/classics/<slug>.md       -> 经典选读（先补课，再追新）
 *   research/radar/<year>-w<week>.md  -> 每周论文雷达
 *   research/deepdive/<slug>.md       -> 论文精读
 *   research/repro/<slug>.md          -> 复现记录（预留）
 *   research/trends/<slug>.md         -> 趋势观察（预留）
 *
 * 不做多语言：与 projects 一样全部用中文撰写，路由在
 * `/research/<kind>/<slug>/`。
 */

/**
 * 论文原文链接。全部必须是「已验证存在」的链接，禁止编造：
 * abs/pdf 直接取自 arXiv API 返回，project/code 只在论文摘要或
 * 项目页明确给出时才填。
 */
const paperLinksSchema = z.object({
  /** 原文摘要页（arXiv abs 页或出版方页面），必填。 */
  abs: z.url(),
  /** PDF 直链（arXiv 均有）。 */
  pdf: z.url().optional(),
  /** 项目主页（论文中明确给出时才填）。 */
  project: z.url().optional(),
  /** 开源代码仓库（确认存在时才填）。 */
  code: z.url().optional(),
});

/**
 * 单篇论文条目。元数据来自 arXiv 等真实来源，禁止编造作者、数字与链接。
 *
 * 技术内容字段（problem/motivation/method/experiments/limitations/
 * recommendation）为必填，强制每篇收录的论文都写清技术细节与原理，
 * 不允许只留一句空洞的点评。涉及数字一律引用论文原文声称的数字。
 */
const paperSchema = z.object({
  title: z.string(),
  authors: z.array(z.string()).min(1),
  /** arXiv 编号，如 "2610.31613"。 */
  arxivId: z.string().optional(),
  /** 论文提交/发表时间。 */
  published: z.coerce.date().optional(),
  /** arXiv 学科分类，如 cs.RO。 */
  categories: z.array(z.string()).default([]),
  /** 站内主题标签，如 VLA / 强化学习 / 世界模型。 */
  topics: z.array(z.string()).default([]),
  /** 原文链接（abs 必填，pdf/project/code 存在时必须附上）。 */
  links: paperLinksSchema,
  /** 解决什么问题。 */
  problem: z.string().min(1),
  /** 相对已有工作的动机与差异。 */
  motivation: z.string().min(1),
  /** 核心方法。 */
  method: z.string().min(1),
  /**
   * 关键数学/机制。出现公式时必须解释每个变量的含义；
   * 支持 `$...$` / `$$...$$`（构建时由 KaTeX 渲染）。
   */
  mechanism: z.string().optional(),
  /** 实验与结果。数字只允许引用论文声称值，并注明「作者声称」。 */
  experiments: z.string().min(1),
  /** 局限与开放问题。 */
  limitations: z.string().min(1),
  /** 推荐理由：为什么值得本站读者花时间。 */
  recommendation: z.string().min(1),
});

/**
 * GitHub 工程仓库条目（雷达的工程板块）：ROS2、规划/控制、运动学/
 * 动力学、仿真器、VLA/IL/RL 工具链、硬件驱动、双臂/灵巧手等。
 * url/star 数/最近动态均须来自 GitHub 真实数据，禁止编造。
 */
const repoSchema = z.object({
  /** "owner/repo" 形式的全名。 */
  name: z.string().regex(/^[\w.-]+\/[\w.-]+$/),
  url: z.url(),
  /** 它是什么、解决什么工程问题。 */
  summary: z.string().min(1),
  /** 站内主题，如 ROS2 / 规划控制 / 运动学动力学 / 仿真 / 双臂。 */
  topics: z.array(z.string()).default([]),
  /** 主要语言。 */
  language: z.string().optional(),
  /** 抓取时的 star 数（随时间变化，记录的是 checkedAt 时刻的值）。 */
  stars: z.number().int().nonnegative().optional(),
  /** 最近动态：最新 release / 近期合入了什么（须来自真实提交/发布记录）。 */
  recentChange: z.string().min(1),
  /** 为什么值得关注。 */
  recommendation: z.string().optional(),
  /** 以上数据的抓取时间。 */
  checkedAt: z.coerce.date().optional(),
});

const research = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/research',
    generateId: preserveFilename,
  }),
  schema: () =>
    baseFrontmatter().extend({
      /**
       * 内容审读状态，驱动页面顶部的提示横幅：
       *   ai-draft  — AI 分析草稿，尚未经本人审读，结论仅供参考；
       *   in-review — 本人审读中，部分章节已校对；
       *   reviewed  — 已全文审读，文责自负。
       */
      status: z.enum(['ai-draft', 'in-review', 'reviewed']).default('ai-draft'),
      /** 雷达条目：本期收录的论文列表（渲染为论文卡片）。 */
      papers: z.array(paperSchema).default([]),
      /** 雷达条目：本期值得关注的 GitHub 工程仓库。 */
      repos: z.array(repoSchema).default([]),
      /** 精读/复现条目：所针对的那一篇论文。 */
      paper: paperSchema.optional(),
    }),
});

export const collections = { posts, pages, projects, research };
