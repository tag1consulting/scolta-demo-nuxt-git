/**
 * Full-corpus index build — the headline parity proof.
 *
 * Builds the complete 1,426-page index with the in-process TS indexer and
 * asserts: a valid, servable Pagefind output; URL parity (fragment urls ==
 * page urls, canonical, no /{id}.html); and the language facet has one value
 * per locale with the expected counts (en 286, es/fr/it/de 285) — the
 * "every page indexed as en" regression guard, the same one the Django demo
 * pins.
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { gunzipSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildGitMasteryIndex } from "../lib/build.js";
import { loadAllPages } from "../lib/content.js";

let tmp: string;
let report: Awaited<ReturnType<typeof buildGitMasteryIndex>>;
let pagefindDir: string;

beforeAll(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "gitmastery-nuxt-"));
  report = await buildGitMasteryIndex({
    configOverrides: { outputDir: path.join(tmp, "public"), stateDir: path.join(tmp, "state"), ai_api_key: "" },
    logger: { info() {}, warn() {}, error() {} },
  });
  pagefindDir = path.join(tmp, "public", "pagefind");
}, 180000);

afterAll(() => {
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
});

function readFragments(): { url: string; language: string; section?: string }[] {
  const dir = path.join(pagefindDir, "fragment");
  return fs.readdirSync(dir).map((f) => {
    let raw = gunzipSync(fs.readFileSync(path.join(dir, f)));
    if (raw.subarray(0, 12).toString("latin1") === "pagefind_dcd") raw = raw.subarray(12);
    const j = JSON.parse(raw.toString("utf-8"));
    // The in-process indexer writes string-valued fragment filters (parity with
    // PHP/Python), e.g. {"language":"en","section":"Getting Started"}.
    return { url: j.url as string, language: String(j.filters?.language ?? ""), section: j.filters?.section as string | undefined };
  });
}

describe("full build", () => {
  it("succeeds over all 1,426 pages", () => {
    expect(report.success).toBe(true);
    expect(report.pagesProcessed).toBe(1426);
  });

  it("produces a valid, servable index (entry.json + runtime assets)", () => {
    expect(fs.existsSync(path.join(pagefindDir, "pagefind-entry.json"))).toBe(true);
    expect(fs.existsSync(path.join(pagefindDir, "pagefind.js"))).toBe(true);
    expect(fs.existsSync(path.join(pagefindDir, "wasm.en.pagefind"))).toBe(true);
    const fragCount = fs.readdirSync(path.join(pagefindDir, "fragment")).filter((f) => f.endsWith(".pf_fragment")).length;
    expect(fragCount).toBe(1426);
  });

  it("URL parity: fragment urls == page urls, canonical (no .html)", () => {
    const fragUrls = new Set(readFragments().map((f) => f.url));
    const pageUrls = new Set(loadAllPages().map((p) => p.url));
    expect(fragUrls).toEqual(pageUrls);
    for (const u of fragUrls) expect(u.endsWith(".html")).toBe(false);
  });

  it("language facet has one value per locale with the expected counts", () => {
    const counts: Record<string, number> = {};
    for (const f of readFragments()) counts[f.language] = (counts[f.language] ?? 0) + 1;
    expect(counts).toEqual({ en: 286, es: 285, fr: 285, it: 285, de: 285 });
  });

  it("section facet is populated", () => {
    const sections = new Set(readFragments().map((f) => f.section).filter(Boolean));
    expect(sections.size).toBeGreaterThan(1);
    expect(sections.has("Getting Started")).toBe(true);
  });
});
