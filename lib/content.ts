/**
 * GitMastery content loader.
 *
 * Loads the same YAML corpus as the Drupal (`git-manual`) and Django/Wagtail
 * (`git-manual-django`) demos and derives identical slugs/URLs, so all three
 * demos are URL-compatible:
 *   - English docs:  /<slug>/            (slug = Django slugify(title))
 *   - About page:    /about/             (EN only, synthesized)
 *   - Translations:  /<lang>/<slug>/     (reuses the English source slug)
 *
 * Total indexable pages: 285 EN docs + 1 About + (285 x 4 translations) = 1,426.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
// js-yaml 5 is ESM-only and exports no default binding, so it is imported as a
// namespace (matching the node: imports above).
import * as yaml from "js-yaml";

// Resolve the corpus dir. The module-relative path is correct when content.ts
// runs directly (the scolta-build CLI), but Nitro bundles server routes and
// rewrites import.meta.url, so the relative `../content` no longer points at the
// project. Fall back to the project root (cwd) — content/ is shipped there — so
// the same loader works both at build time and inside the Nitro dev server.
function resolveContentDir(): string {
  const candidates: string[] = [];
  try {
    candidates.push(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "content"));
  } catch {
    // import.meta.url is not a file: URL in this runtime — skip the module-relative candidate.
  }
  candidates.push(path.resolve(process.cwd(), "content"));
  return candidates.find((dir) => fs.existsSync(path.join(dir, "en"))) ?? candidates[candidates.length - 1]!;
}

const CONTENT_DIR = resolveContentDir();
export const LANGS = ["es", "fr", "it", "de"] as const;
export type TranslationLang = (typeof LANGS)[number];

export type PageType = "documentation_page" | "tutorial" | "comparison" | "tip" | "about";

export interface GitMasteryPage {
  id: string;
  title: string;
  body: string;
  url: string;
  language: string;
  type: PageType;
  section: string;
  difficulty: string;
  gitVersion: string;
  weight: number;
}

interface RawEntry {
  title?: string;
  source_title?: string;
  type?: string;
  section?: string;
  difficulty?: string;
  git_version?: string;
  weight?: number;
  body?: string;
}

/** Port of the About page body from the Drupal/Django importer (EN only). */
const ABOUT_BODY =
  "<h2>About This Site</h2>" +
  "<p><strong>GitMastery is a fictional website.</strong> It was created by Tag1 " +
  "Consulting to demonstrate the capabilities of Scolta, an open-source AI-powered " +
  "search platform, on a content-rich technical reference site built with Next.js.</p>" +
  "<h2>What You Are Looking At</h2>" +
  "<p>This site contains 285 pages of English Git reference content across categories " +
  "including getting started, core concepts, advanced workflows, comparisons, and tips. " +
  "All content is available in five languages: English, German, Spanish, French, and " +
  "Italian, demonstrating Scolta's multilingual search capabilities.</p>" +
  "<h2>What Scolta Does Here</h2>" +
  "<p>The search bar uses Scolta to let you explore the Git documentation by asking " +
  "natural-language questions. Scolta uses Pagefind for full-text indexing, Claude via " +
  "the Anthropic API for query expansion and AI overviews, and a custom scoring layer.</p>" +
  "<h2>About Tag1 Consulting</h2>" +
  "<p>Tag1 Consulting built and open-sources Scolta. For more information, visit " +
  '<a href="https://tag1.com">tag1.com</a>.</p>';

/** Django `django.utils.text.slugify(value)` — ASCII, lowercase, hyphenated. */
export function slugify(value: string): string {
  // NFKD normalize, drop non-ASCII (accents decompose to base + combining mark;
  // dropping non-ASCII leaves the base letter), then Django's regex pipeline.
  // eslint-disable-next-line no-control-regex -- ASCII range incl. control chars, matching Django's encode('ascii','ignore')
  const ascii = value.normalize("NFKD").replace(/[^\x00-\x7F]/g, "");
  const cleaned = ascii
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase();
  return cleaned.replace(/[-\s]+/g, "-");
}

/** Port of the importer's `_unique_slug`: stable, collision-suffixed. */
function uniqueSlug(title: string, used: Set<string>): string {
  let base = slugify(title) || "page";
  base = base.slice(0, 230);
  let slug = base;
  let i = 2;
  while (used.has(slug)) {
    slug = `${base}-${i}`;
    i += 1;
  }
  return slug;
}

function readYamlList(file: string): RawEntry[] {
  // js-yaml (PyYAML-equivalent) — matches the load semantics the Drupal/Django
  // importers used, including folded double-quoted scalars the stricter YAML 1.2
  // parsers reject.
  const data = yaml.load(fs.readFileSync(file, "utf-8"));
  return Array.isArray(data) ? (data as RawEntry[]) : [];
}

function sortedBatch(dir: string, prefix: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(prefix) && f.endsWith(".yaml"))
    .sort()
    .map((f) => path.join(dir, f));
}

function pageType(raw: string | undefined): PageType {
  switch (raw) {
    case "tutorial":
    case "comparison":
    case "tip":
      return raw;
    default:
      return "documentation_page";
  }
}

export interface EnglishDoc extends GitMasteryPage {
  slug: string;
}

/** Load the 285 English docs (file order, with stable unique slugs). */
export function loadEnglishDocs(): EnglishDoc[] {
  const used = new Set<string>(["home", "about"]);
  const docs: EnglishDoc[] = [];
  for (const file of sortedBatch(path.join(CONTENT_DIR, "en"), "content-en-batch")) {
    for (const entry of readYamlList(file)) {
      if (!entry.title) continue;
      const slug = uniqueSlug(entry.title, used);
      used.add(slug);
      docs.push({
        id: `en:${slug}`,
        title: entry.title,
        body: entry.body ?? "",
        url: `/${slug}/`,
        language: "en",
        type: pageType(entry.type),
        section: entry.section ?? "",
        difficulty: entry.difficulty ?? "",
        gitVersion: entry.git_version ?? "",
        weight: Number(entry.weight ?? 0),
        slug,
      });
    }
  }
  return docs;
}

/** The synthesized English About page. */
export function aboutPage(): GitMasteryPage {
  return {
    id: "en:about",
    title: "About This Demo",
    body: ABOUT_BODY,
    url: "/about/",
    language: "en",
    type: "about",
    section: "",
    difficulty: "",
    gitVersion: "",
    weight: 0,
  };
}

/** Load one language's translations, linked to English sources by source_title. */
export function loadTranslations(lang: TranslationLang, englishBySourceTitle: Map<string, EnglishDoc>): GitMasteryPage[] {
  const out: GitMasteryPage[] = [];
  for (const file of sortedBatch(path.join(CONTENT_DIR, "translations"), `content-${lang}-batch`)) {
    for (const entry of readYamlList(file)) {
      const sourceTitle = entry.source_title;
      const title = entry.title;
      if (!sourceTitle || !title) continue;
      const source = englishBySourceTitle.get(sourceTitle);
      if (!source) continue;
      out.push({
        id: `${lang}:${source.slug}`,
        title,
        body: entry.body ?? "",
        url: `/${lang}/${source.slug}/`,
        language: lang,
        type: source.type,
        section: source.section,
        difficulty: source.difficulty,
        gitVersion: source.gitVersion,
        weight: source.weight,
      });
    }
  }
  return out;
}

/** Load the full indexable corpus (286 EN + 285 x 4 translations = 1,426). */
export function loadAllPages(): GitMasteryPage[] {
  const docs = loadEnglishDocs();
  const bySourceTitle = new Map<string, EnglishDoc>();
  for (const d of docs) bySourceTitle.set(d.title, d);

  const pages: GitMasteryPage[] = [...docs, aboutPage()];
  for (const lang of LANGS) {
    pages.push(...loadTranslations(lang, bySourceTitle));
  }
  return pages;
}

// -- memoized helpers for the Next app -------------------------------------

let memoPages: GitMasteryPage[] | null = null;
let memoUrlMap: Map<string, GitMasteryPage> | null = null;

export function allPages(): GitMasteryPage[] {
  return (memoPages ??= loadAllPages());
}

function urlMap(): Map<string, GitMasteryPage> {
  if (memoUrlMap === null) {
    memoUrlMap = new Map();
    for (const p of allPages()) memoUrlMap.set(p.url, p);
  }
  return memoUrlMap;
}

/** Resolve a catch-all `[...slug]` segment array to a page (or undefined). */
export function pageBySlugSegments(segments: string[]): GitMasteryPage | undefined {
  return urlMap().get("/" + segments.join("/") + "/");
}

/** All catch-all params for `generateStaticParams` (slug arrays without slashes). */
export function allSlugParams(): { slug: string[] }[] {
  return allPages().map((p) => ({ slug: p.url.replace(/^\/|\/$/g, "").split("/") }));
}

export interface NavLink {
  title: string;
  url: string;
}
export interface NavSection {
  section: string;
  pages: NavLink[];
}

/**
 * Group the English docs by section in first-seen order (the sidebar nav and the
 * home-page section grid render from this — parity with Django's `section_nav`).
 */
export function sectionNav(): NavSection[] {
  const order: string[] = [];
  const bySection = new Map<string, NavLink[]>();
  for (const d of loadEnglishDocs()) {
    if (!d.section) continue;
    if (!bySection.has(d.section)) {
      bySection.set(d.section, []);
      order.push(d.section);
    }
    bySection.get(d.section)!.push({ title: d.title, url: d.url });
  }
  return order.map((section) => ({ section, pages: bySection.get(section)! }));
}

/** The set of EN doc slugs (used to decide which pages have translations). */
export function translatableSlugs(): string[] {
  return loadEnglishDocs().map((d) => d.slug);
}
