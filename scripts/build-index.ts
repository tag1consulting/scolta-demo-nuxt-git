#!/usr/bin/env tsx
/**
 * Build the GitMastery Pagefind index from the registered content source.
 * Run via `npm run scolta:build`. Content mode needs the app's own source, so
 * this lives in the demo rather than the generic `scolta-build` CLI.
 */

import { buildGitMasteryIndex } from "../lib/build.js";

const report = await buildGitMasteryIndex({ logger: console });
if (!report.success) {
  console.error(`[scolta] Build failed: ${report.error}`);
  process.exit(1);
}
console.log(`[scolta] ${report.toBuildResult().message}`);
