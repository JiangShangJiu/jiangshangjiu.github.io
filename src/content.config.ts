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

export const collections = { posts, pages, projects };
