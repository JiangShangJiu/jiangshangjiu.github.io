/**
 * Project ("成果") helpers.
 *
 * Projects are a custom collection that is not part of the upstream theme.
 * They are filesystem-routed at `/projects/<filename>/` and are written in
 * Chinese only, so unlike posts they are not split per locale.
 */

import { getCollection, type CollectionEntry } from 'astro:content';

import type { Locale } from '../config';
import { localizedPath } from '../i18n/utils';

export type Project = CollectionEntry<'projects'>;

/** All published projects, sorted by `order` then title. */
export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects', (entry) => {
    if (import.meta.env.PROD && entry.data.draft) return false;
    return true;
  });
  return all.sort(
    (a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title, 'zh-CN'),
  );
}

/** URL slug for a project: its filename without the extension. */
export function projectSlug(entry: Project): string {
  return entry.id.replace(/\.(md|mdx)$/i, '');
}

/** Localized URL path for a project detail page. */
export function projectPath(entry: Project, locale: Locale): string {
  return localizedPath(`/projects/${projectSlug(entry)}/`, locale);
}

/** Localized URL path for the projects index. */
export function projectsIndexPath(locale: Locale): string {
  return localizedPath('/projects/', locale);
}

/** Localized URL path for the blog index. */
export function blogIndexPath(locale: Locale): string {
  return localizedPath('/blog/', locale);
}
