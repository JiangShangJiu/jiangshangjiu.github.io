/**
 * UI dictionaries.
 *
 * This site ships a single locale (`zh`). If you ever add another language,
 * add a key here AND to `SITE.locales` in `src/config.ts` — TypeScript
 * enforces that every locale provides every key.
 */

import type { Locale } from '../config';

export const messages = {
  zh: {
    'site.skipToContent': '跳到正文',
    'nav.home': '首页',
    'nav.projects': '成果',
    'nav.posts': '博客',
    'nav.tags': '标签',
    'nav.categories': '分类',
    'nav.archives': '归档',
    'nav.about': '关于',
    'nav.search': '搜索',
    'nav.toggleMenu': '切换菜单',

    'theme.toggle': '切换主题',
    'theme.light': '浅色',
    'theme.dark': '深色',
    'theme.system': '跟随系统',

    'lang.switcher': '语言',
    'lang.zh': '中文',

    'post.publishedOn': '发布于',
    'post.updatedOn': '更新于',
    'post.readingTime': '分钟阅读',
    'post.toc': '目录',
    'post.tags': '标签',
    'post.categories': '分类',
    'post.previous': '上一篇',
    'post.next': '下一篇',
    'post.comments': '评论',
    'post.commentsDisabled': '本文已关闭评论。',
    'post.commentsSetupTitle': '评论系统尚未配置',
    'post.commentsSetupBody': 'Giscus 已启用但还没有填好仓库信息。填入下面的配置即可开启评论。',
    'post.commentsSetupStep1':
      '打开 `giscus.app`，选择一个公开的 GitHub 仓库（需要先在仓库设置里开启 Discussions）。',
    'post.commentsSetupStep2': '复制生成的 `data-repo-id`、`data-category` 和 `data-category-id`。',
    'post.commentsSetupStep3':
      '把 `PUBLIC_GISCUS_ENABLED`、`PUBLIC_GISCUS_REPO`、`PUBLIC_GISCUS_REPO_ID`、`PUBLIC_GISCUS_CATEGORY` 和 `PUBLIC_GISCUS_CATEGORY_ID` 写入 `.env`。',
    'post.commentsSetupStep4': '重新构建站点，这段提示会被真实的评论框替代。',
    'post.commentsSetupDocs': '打开 giscus.app',
    'post.share': '分享',
    'post.copyLink': '复制链接',
    'post.copied': '已复制！',
    'post.author': '作者',

    'list.allPosts': '全部文章',
    'list.featured': '精选文章',
    'list.recent': '最新文章',
    'list.empty': '还没有文章。',
    'list.tagPosts': '标签',
    'list.categoryPosts': '分类',
    'list.totalPosts': '篇文章',
    'list.totalPostsOne': '篇文章',

    'panel.recentlyUpdated': '最近更新',

    'pagination.previous': '上一页',
    'pagination.next': '下一页',
    'pagination.page': '第',
    'pagination.of': '页，共',

    'archives.title': '归档',
    'archives.empty': '还没有文章。',

    'tags.title': '标签',
    'tags.empty': '还没有标签。',
    'tags.trending': '热门标签',

    'categories.title': '分类',
    'categories.empty': '还没有分类。',

    'projects.title': '成果',
    'projects.subtitle': '我做过的一些项目与实验。',
    'projects.empty': '还没有成果条目。',
    'projects.backToProjects': '返回成果',

    'search.title': '搜索',
    'search.placeholder': '搜索本站内容',
    'search.openLabel': '打开搜索',
    'search.closeLabel': '关闭搜索',
    'search.empty': '没有找到结果。',
    'search.loading': '正在加载搜索…',
    'search.typeToStart': '输入关键词开始搜索…',
    'search.hintShortcut': '按 / 随时打开搜索',
    'search.searching': '搜索中…',
    'search.noResultsFor': '没有匹配',
    'search.resultsCount': '条结果',
    'search.resultsCountOne': '条结果',
    'search.hintNavigate': '选择',
    'search.hintSelect': '打开',
    'search.clearLabel': '清空',

    'code.copy': '复制',
    'code.copied': '已复制',

    '404.title': '页面不存在',
    '404.description': '你要找的页面已经飞走了。',
    '404.cta': '返回首页',

    'footer.poweredBy': '驱动自',
    'footer.theme': '主题',
    'footer.privacy': '隐私政策',
    'footer.copyright': '保留所有权利。',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof (typeof messages)[Locale];
