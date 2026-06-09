/**
 * Scolta configuration for the GitMastery (Nuxt) demo — feature-parity with the
 * Drupal, Django, and Next.js demos: the `reference` preset, five AI languages,
 * and section / difficulty / language facet filters. Also passed to the
 * scolta-nuxt module via `nuxt.config`'s `scolta` key.
 */

import { NuxtScoltaConfig, type NuxtScoltaConfigInit } from "scolta-nuxt/core";

export const scoltaConfigInit: NuxtScoltaConfigInit = {
  source: "content",
  site_name: "GitMastery",
  site_description: "Git documentation reference",
  preset: "reference",
  // Auto-enable Scolta AI with no key: provision a free Amazee.ai LiteLLM trial
  // on first use (parity with the Drupal/Django demos). Override with an
  // explicit provider/key via SCOLTA_AI_PROVIDER + SCOLTA_API_KEY (env wins).
  ai_provider: "amazee",
  ai_languages: ["en", "es", "fr", "it", "de"],
  filter_fields: ["section", "difficulty", "language"],
  filter_field_descriptions: {
    section: "Documentation section (Getting Started, Core Concepts, Advanced Workflows, Comparisons, Tips)",
    difficulty: "Difficulty level (Beginner, Intermediate, Advanced)",
    language: "Content language (en, es, fr, it, de)",
  },
  results_per_page: 12,
  // Content mode: write the index into public/ so it serves at /pagefind.
  stateDir: ".scolta",
  outputDir: "public",
  assetsPublicPath: "/scolta",
};

export function getConfig(): NuxtScoltaConfig {
  return NuxtScoltaConfig.fromEnv(scoltaConfigInit);
}
