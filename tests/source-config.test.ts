/** Content source mapping + config round-trip + Nitro AI handler wiring. */

import { describe, expect, it } from "vitest";
import { ContentItem } from "scolta";
import { createScoltaApi } from "scolta-nuxt/core";
import { GitMasterySource, toContentItem } from "../lib/source.js";
import { aboutPage, loadEnglishDocs } from "../lib/content.js";
import { getConfig, scoltaConfigInit } from "../lib/config.js";

describe("content source", () => {
  it("maps a page to a ContentItem with locale + facet filters", () => {
    const doc = loadEnglishDocs()[0]!;
    const item = toContentItem(doc);
    expect(item).toBeInstanceOf(ContentItem);
    expect(item.language).toBe("en");
    expect(item.siteName).toBe("GitMastery");
    expect(item.filters["section"]).toBe(doc.section);
  });

  it("omits empty facet filters (About page)", () => {
    const item = toContentItem(aboutPage());
    expect("section" in item.filters).toBe(false);
  });

  it("enumerate yields the full corpus", () => {
    const items = [...new GitMasterySource().enumerate()];
    expect(items.length).toBe(1426);
    expect(items.every((i) => i instanceof ContentItem)).toBe(true);
  });
});

describe("config round-trip", () => {
  it("reflects the reference preset + 5 languages + facet filters", () => {
    const config = getConfig();
    expect(config.scolta.preset).toBe("reference");
    expect(config.scolta.ai_languages).toEqual(["en", "es", "fr", "it", "de"]);
    expect(config.scolta.filter_fields).toEqual(["section", "difficulty", "language"]);
    expect(config.scolta.results_per_page).toBe(12);
    expect(config.outputDir).toBe("public");
  });

  it("browser config reflects SAVED values (Release Gate family 4)", () => {
    const b = getConfig().toBrowserConfig();
    expect(b["siteName"]).toBe("GitMastery");
    expect((b["scoring"] as any)["RESULTS_PER_PAGE"]).toBe(12);
  });

  it("scoltaConfigInit is content mode", () => {
    expect(scoltaConfigInit.source).toBe("content");
  });
});

describe("Nitro AI handler logic (createScoltaApi)", () => {
  it("expandQuery degrades gracefully with no API key", async () => {
    const api = createScoltaApi(getConfig(), { logger: { error() {} } });
    const r = await api.expandQuery({ query: "rebase" });
    expect(r.ok).toBe(true);
    expect((r.data as any).terms).toEqual(["rebase"]);
  });

  it("health reflects saved scoring", async () => {
    const api = createScoltaApi(getConfig(), { logger: { error() {} } });
    const h = await api.health();
    expect((h["scoring"] as any).RESULTS_PER_PAGE).toBe(12);
  });
});
