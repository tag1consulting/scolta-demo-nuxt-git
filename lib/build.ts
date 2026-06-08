/**
 * Build the GitMastery Pagefind index from the content source using the
 * in-process TS indexer (via scolta-nuxt). Used by `scripts/build-index.ts`
 * (the `scolta:build` script) and by the test suite (with temp dirs).
 */

import { buildIndex, NuxtScoltaConfig, type NuxtScoltaConfigInit } from "scolta-nuxt/core";
import { getConfig, scoltaConfigInit } from "./config.js";
import { GitMasterySource } from "./source.js";

export interface BuildOpts {
  mode?: "fresh" | "resume" | "restart";
  force?: boolean;
  configOverrides?: Partial<NuxtScoltaConfigInit>;
  logger?: { info(m: string, ...a: unknown[]): void; warn(m: string, ...a: unknown[]): void; error(m: string, ...a: unknown[]): void };
}

export async function buildGitMasteryIndex(opts: BuildOpts = {}) {
  const config = opts.configOverrides
    ? NuxtScoltaConfig.fromEnv({ ...scoltaConfigInit, ...opts.configOverrides })
    : getConfig();
  return buildIndex(config, {
    source: new GitMasterySource(),
    mode: opts.mode,
    force: opts.force,
    logger: opts.logger,
  });
}
