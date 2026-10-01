import process from 'node:process';
import avatarImg from './assets/images/site/avatar.svg';
import ogDefaultImg from './assets/images/site/og-default.svg';
import type { GiscusConfig, NavItem, ProfileConfig, SiteConfig, SocialLink } from './types/config';

/**
 * Global site + theme configuration.
 * Edit values here to rebrand the theme. All values are typed and consumed
 * across layouts, components, RSS, sitemap, and SEO.
 */

// Export imported site images for use in components
export const SITE_IMAGES = {
  avatar: avatarImg,
  ogDefault: ogDefaultImg,
} as const;

/**
 * Supported locales. This site is Chinese-only, so a single locale is
 * declared and `SITE.multilingual` below is switched off (which hides the
 * language switcher). Content lives in `src/content/<collection>/zh/**`,
 * and because `zh` is the default locale all URLs are served WITHOUT a
 * prefix (`/posts/foo`, not `/zh/posts/foo`) — matching the previous
 * Jekyll permalinks.
 */
export const locales = ['zh'] as const;
export type Locale = (typeof locales)[number];

/** Public author identity. These are all publicly visible values. */
const GITHUB_HANDLE = import.meta.env.PUBLIC_GITHUB_HANDLE || 'JiangShangJiu';
export const CONTACT_EMAIL = import.meta.env.PUBLIC_CONTACT_EMAIL || 'laplacehurt@gmail.com';
const THEME_REPO_URL = 'https://github.com/kannansuresh/chirping-astro';

export const REPO = {
  handle: GITHUB_HANDLE,
  name: 'jiangshangjiu.github.io',
  url: `https://github.com/${GITHUB_HANDLE}/jiangshangjiu.github.io`,
} as const;

export const SITE: SiteConfig = {
  /** Default site title used as homepage <title> and meta. */
  title: '孔乙己',
  /**
   * Sub-title shown in italics under the title in the sidebar (Chirpy's
   * `.site-subtitle`). Verbatim from the previous site's `_config.yml`, where
   * YAML folded the five source lines into one space-joined string.
   */
  tagline:
    '初从文，三年不中； 后习武，校场发一矢，中鼓吏，逐之出； 又从商，一遇骗，二遇盗，三遇匪； 遂躬耕，一岁大旱，一岁大涝，一岁飞蝗； 乃学医，有所成。自撰一良方，服之，卒。',
  /** Site tagline / description. */
  description: '孔乙己的个人博客：机器人、具身智能、运动规划、C++ 与并发编程的学习笔记与原理解析。',
  /** Author/handle shown in footer + meta. */
  author: {
    name: '孔乙己',
    url: `https://github.com/${GITHUB_HANDLE}`,
    avatar: avatarImg,
  },
  /** Default OG image. */
  defaultOgImage: ogDefaultImg.src,
  /** Number of posts per page on listings. */
  postsPerPage: 8,
  /** Display ISO 8601 date format if true, otherwise locale-aware. */
  isoDates: false,
  /** Site-wide default for whether posts should display their featured image. */
  showFeaturedImages: false,
  /** Wrap the article body of posts and pages in a bordered, card-like container. */
  boxedArticles: false,
  /** Allow listing cards to grow when title/description content is longer. */
  dynamicPostCardHeight: false,
  /** Automatically generate Open Graph images for posts that don't have a `heroImage`. */
  autoOgImage: true,
  /** Show a link to the Privacy Policy page in the footer. */
  showPrivacyPolicy: false,
  /** Footer text/link controls. */
  footer: {
    /**
     * Optional full override for the left footer line. Supports {year} and {author}.
     * Default when undefined: "© {year} {author}. All rights reserved."
     */
    leftText: undefined,
    /**
     * Optional custom text before the theme link on the right footer line.
     */
    rightText: undefined,
    /** Whether to show the Privacy Policy link in the footer. */
    showPrivacyPolicy: false,
    /** Whether to show theme credits in the footer right side. Theme <themeName> */
    showThemeCredits: true,
    /** Label for the theme repository link in the right footer line. */
    themeName: 'Chirping Astro',
    /** Default upstream theme repository. */
    themeUrl: THEME_REPO_URL,
  },

  /** Public URL of the deployed site, no trailing slash. */
  url: (process.env.SITE_URL || 'https://jiangshangjiu.github.io').replace(/\/+$/, ''),
  /** Supported locales. */
  locales: locales,
  /** Default locale. */
  defaultLocale: 'zh',
  /** Show the language switcher and link to translated pages. */
  multilingual: false,
};

/**
 * Homepage profile ("个人展示页") content.
 *
 * Ported from the `profile` block that used to live in the Jekyll site's
 * `_config.yml`. Edit the copy here — the homepage, the "关于" page and the
 * footer all read from these values.
 *
 * Icons are iconify names (`lucide:*` / `simple-icons:*`), not the Font
 * Awesome classes the Jekyll theme used.
 */
export const PROFILE: ProfileConfig = {
  name: '孔乙己',
  role: '机器人软件工程师 · 具身智能',
  lead: '专注于机械臂动力学建模、参数辨识与运动控制。习惯把算法背后的数学推一遍再落地，并把推导过程写成长文发布在博客里。',
  facts: [
    { icon: 'lucide:map-pin', text: '城市待填' },
    { icon: 'lucide:graduation-cap', text: '学历 / 院校待填' },
    { icon: 'lucide:briefcase', text: '方向：机械臂 · 运动规划 · 力控' },
  ],
  actions: [
    { label: '查看成果', url: '/projects/', icon: 'lucide:boxes', primary: true },
    { label: '读博客', url: '/blog/', icon: 'lucide:newspaper' },
    {
      label: 'GitHub',
      url: `https://github.com/${GITHUB_HANDLE}`,
      icon: 'simple-icons:github',
      external: true,
    },
    { label: '邮箱', url: `mailto:${CONTACT_EMAIL}`, icon: 'lucide:mail' },
  ],
};

/**
 * Primary navigation. `key` maps to an i18n message; `href` is the path
 * WITHOUT any locale prefix.
 *
 * NOTE: the `/projects` entry points at a custom page that is not part of
 * the upstream theme (see `src/pages/[...locale]/projects/`).
 */
export const NAV: readonly NavItem[] = [
  { key: 'home', href: '/', icon: 'lucide:home' },
  { key: 'projects', href: '/projects', icon: 'lucide:boxes' },
  { key: 'posts', href: '/blog', icon: 'lucide:newspaper' },
  { key: 'categories', href: '/categories', icon: 'lucide:layers' },
  { key: 'tags', href: '/tags', icon: 'lucide:tag' },
  { key: 'archives', href: '/archives', icon: 'lucide:archive' },
  { key: 'about', href: '/about', icon: 'lucide:id-card' },
] as const;

/**
 * SOCIALS is built from the constants above so there is a single place to
 * edit author links. RSS is always present.
 */
export const SOCIALS: readonly SocialLink[] = [
  {
    label: 'GitHub',
    href: `https://github.com/${GITHUB_HANDLE}`,
    icon: 'simple-icons:github',
  },
  {
    label: 'Email',
    href: `mailto:${CONTACT_EMAIL}`,
    icon: 'lucide:mail',
  },
  { label: 'RSS', href: '/rss.xml', icon: 'lucide:rss' },
] as const;

/**
 * Giscus comments. Values carried over from the previous Jekyll/Chirpy
 * configuration. `mapping: 'pathname'` keys each discussion thread to the
 * page URL, so preserving the old `/posts/<slug>/` URLs also preserves the
 * existing comment threads.
 *
 * Individual posts may opt out via frontmatter `comments: false`.
 */
export const GISCUS: GiscusConfig = {
  // `||` (not `??`) so an explicitly empty CI variable falls back to the
  // committed default instead of silently disabling comments.
  enabled: (import.meta.env.PUBLIC_GISCUS_ENABLED || 'true') === 'true',
  repo: import.meta.env.PUBLIC_GISCUS_REPO || 'JiangShangJiu/jiangshangjiu.github.io',
  repoId: import.meta.env.PUBLIC_GISCUS_REPO_ID || 'R_kgDOLwslTw',
  category: import.meta.env.PUBLIC_GISCUS_CATEGORY || 'Announcements',
  categoryId: import.meta.env.PUBLIC_GISCUS_CATEGORY_ID || 'DIC_kwDOLwslT84Ce5M9',
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'bottom',
  loading: 'lazy',
};

/**
 * Pagefind runtime settings. The index itself is generated by
 * `npm run pagefind` after `astro build` and written to `dist/_pagefind/`.
 */
export const PAGEFIND = {
  /** Public path where the Pagefind bundle is served. */
  bundlePath: '/_pagefind/',
  /** Number of results to render per locale. */
  pageSize: 10,
} as const;
