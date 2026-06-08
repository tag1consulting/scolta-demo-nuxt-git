/** Content loading + Django-parity slug/URL derivation. */

import { describe, expect, it } from "vitest";
import {
  LANGS,
  aboutPage,
  allSlugParams,
  loadAllPages,
  loadEnglishDocs,
  loadTranslations,
  pageBySlugSegments,
  slugify,
  type EnglishDoc,
} from "../lib/content.js";

describe("slugify (Django parity)", () => {
  it.each([
    ["What is Git? (and what isn't it)", "what-is-git-and-what-isnt-it"],
    ["Installing Git (Linux, macOS, Windows)", "installing-git-linux-macos-windows"],
    ["git rebase --onto", "git-rebase-onto"],
    ["Café déjà vu", "cafe-deja-vu"],
    ["HEAD~3 vs HEAD^", "head3-vs-head"],
  ])("%s -> %s", (title, expected) => {
    expect(slugify(title)).toBe(expected);
  });
});

describe("English docs", () => {
  const docs = loadEnglishDocs();

  it("loads exactly 285 docs", () => {
    expect(docs.length).toBe(285);
  });

  it("all English, with /<slug>/ urls and unique slugs", () => {
    const slugs = new Set<string>();
    for (const d of docs) {
      expect(d.language).toBe("en");
      expect(d.url).toBe(`/${d.slug}/`);
      expect(slugs.has(d.slug)).toBe(false);
      slugs.add(d.slug);
    }
    // The reserved home/about slugs are never used by a doc.
    expect(slugs.has("home")).toBe(false);
    expect(slugs.has("about")).toBe(false);
  });

  it("a known title resolves to its Django slug", () => {
    const first = docs.find((d) => d.title.startsWith("What is Git"));
    expect(first?.url).toBe("/what-is-git-and-what-isnt-it/");
  });
});

describe("About page", () => {
  it("is English at /about/", () => {
    const a = aboutPage();
    expect(a.url).toBe("/about/");
    expect(a.language).toBe("en");
    expect(a.type).toBe("about");
  });
});

describe("translations", () => {
  const docs = loadEnglishDocs();
  const bySourceTitle = new Map<string, EnglishDoc>(docs.map((d) => [d.title, d]));

  it.each([...LANGS])("%s: 285 pages at /<lang>/<slug>/ linked to EN sources", (lang) => {
    const t = loadTranslations(lang, bySourceTitle);
    expect(t.length).toBe(285);
    for (const p of t) {
      expect(p.language).toBe(lang);
      expect(p.url.startsWith(`/${lang}/`)).toBe(true);
      // The slug segment matches an English source slug (shared path).
      const slug = p.url.slice(`/${lang}/`.length, -1);
      expect(docs.some((d) => d.slug === slug)).toBe(true);
    }
  });
});

describe("full corpus", () => {
  const pages = loadAllPages();

  it("totals 1,426 indexable pages", () => {
    expect(pages.length).toBe(1426);
  });

  it("per-language counts (en 286, others 285)", () => {
    const counts: Record<string, number> = {};
    for (const p of pages) counts[p.language] = (counts[p.language] ?? 0) + 1;
    expect(counts).toEqual({ en: 286, es: 285, fr: 285, it: 285, de: 285 });
  });

  it("every URL is unique and canonical (no .html)", () => {
    const urls = new Set<string>();
    for (const p of pages) {
      expect(urls.has(p.url)).toBe(false);
      urls.add(p.url);
      expect(p.url.endsWith(".html")).toBe(false);
    }
    expect(urls.size).toBe(1426);
  });
});

describe("app lookups", () => {
  it("resolves a doc, a translation, and about by slug segments", () => {
    expect(pageBySlugSegments(["what-is-git-and-what-isnt-it"])?.language).toBe("en");
    expect(pageBySlugSegments(["es", "what-is-git-and-what-isnt-it"])?.language).toBe("es");
    expect(pageBySlugSegments(["about"])?.type).toBe("about");
    expect(pageBySlugSegments(["does-not-exist"])).toBeUndefined();
  });

  it("generateStaticParams yields one entry per page", () => {
    expect(allSlugParams().length).toBe(1426);
    expect(allSlugParams()).toContainEqual({ slug: ["es", "what-is-git-and-what-isnt-it"] });
  });
});
