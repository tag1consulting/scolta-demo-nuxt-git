/**
 * GitMastery content source for Scolta (content mode) — identical mapping to
 * the Next.js demo (it is CMS-side, not framework-side): per-page locale drives
 * the language facet; section/difficulty become filters. The binding adds the
 * `language` and `site` filters automatically.
 */

import { ContentItem } from "scolta";
import type { ScoltaContentSource } from "scolta-nuxt/core";
import { loadAllPages, type GitMasteryPage } from "./content.js";

export function toContentItem(page: GitMasteryPage): ContentItem {
  const filters: Record<string, string> = {};
  if (page.section) filters["section"] = page.section;
  if (page.difficulty) filters["difficulty"] = page.difficulty;
  return new ContentItem({
    id: page.id,
    title: page.title,
    bodyHtml: page.body,
    url: page.url,
    date: "",
    siteName: "GitMastery",
    language: page.language,
    filters,
  });
}

export class GitMasterySource implements ScoltaContentSource {
  *enumerate(): Generator<ContentItem> {
    for (const page of loadAllPages()) {
      yield toContentItem(page);
    }
  }
}
