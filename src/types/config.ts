import type { Locale } from '../config';
import type { ImageMetadata } from 'astro';

export interface SiteConfig {
  title: string;
  /** Chirpy's `.site-subtitle`: shown in italics under the title in the sidebar. */
  tagline: string;
  description: string;
  author: {
    name: string;
    url?: string;
    avatar?: string | ImageMetadata;
  };
  defaultOgImage: string;
  postsPerPage: number;
  isoDates: boolean;
  showFeaturedImages: boolean;
  boxedArticles: boolean;
  dynamicPostCardHeight: boolean;
  autoOgImage: boolean;
  showPrivacyPolicy: boolean;
  footer: {
    /** Optional full override for the left footer line. Supports {year} and {author}. */
    leftText?: string;
    /** Optional custom text shown before the theme link on the right footer line. */
    rightText?: string;
    /** Whether to show the Privacy Policy link in the footer. */
    showPrivacyPolicy?: boolean;
    /** Whether to show theme credits in the footer right side. */
    showThemeCredits?: boolean;
    /** Theme label text used by the right footer link. */
    themeName: string;
    /** Theme repository URL used by the right footer link. */
    themeUrl: string;
  };
  url: string;
  locales: readonly Locale[];
  defaultLocale: Locale;
  multilingual: boolean;
}

export interface NavItem {
  /** Unique key matching i18n.ts entries. */
  key: string;
  /** Path WITHOUT leading locale prefix. The renderer adds it. */
  href: string;
  /** Optional icon name (e.g. "home", "tags"). */
  icon?: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

/**
 * Homepage profile section — ported from the previous Jekyll site's
 * `profile` block in `_config.yml`. Rendered by
 * `src/pages/[...locale]/index.astro`.
 */
export interface ProfileFact {
  /** Iconify icon name, e.g. `lucide:briefcase`. */
  icon?: string;
  text: string;
}

export interface ProfileAction {
  label: string;
  url: string;
  icon?: string;
  /** Renders as a filled (primary) button. */
  primary?: boolean;
  /** Opens in a new tab with `rel="noopener noreferrer"`. */
  external?: boolean;
}

export interface ProfileConfig {
  name: string;
  /** One-line positioning statement. */
  role: string;
  /** 2-3 sentence introduction. */
  lead: string;
  facts: readonly ProfileFact[];
  actions: readonly ProfileAction[];
}

export interface GiscusConfig {
  /** Master switch. */
  enabled: boolean;
  /** GitHub repo (e.g. `user/repo`). */
  repo: string;
  /** Repo ID (from giscus.app). */
  repoId: string;
  /** Discussion category. */
  category: string;
  /** Category ID. */
  categoryId: string;
  /** Discussion mapping strategy. */
  mapping: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number';
  /** Strict matching. */
  strict: '0' | '1';
  /** Enable reactions on the main post. */
  reactionsEnabled: '0' | '1';
  /** Emit metadata events. */
  emitMetadata: '0' | '1';
  /** Comment input position. */
  inputPosition: 'top' | 'bottom';
  /** Lazy load. */
  loading: 'lazy' | 'eager';
}
