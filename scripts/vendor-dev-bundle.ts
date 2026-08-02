#!/usr/bin/env tsx
/**
 * Overlay the browser bundle from scolta-node's unreleased main.
 *
 * TEMPORARY, and removed at the coordinated 1.1.1 release.
 *
 * The search-as-you-type suggestion API (Scolta.setSuggestionRenderer) is
 * merged to scolta-node's main and deliberately not tagged, so the demo has to
 * track the dev line to use it. The obvious way to do that — pointing the
 * "scolta" dependency at github:tag1consulting/scolta-node#main — does not
 * work: the package builds dist/ with tsup and has no "prepare" script, so npm
 * installs a git checkout with assets/ present and dist/ missing, and every
 * build-time import of ContentItem fails with ERR_MODULE_NOT_FOUND.
 *
 * So the dependency splits in two. "scolta" stays on the npm release, which is
 * what the build scripts import; "scolta-dev-bundle" is the same package
 * installed from main, and only its browser assets are used. That is safe here
 * because the two revisions differ in exactly the browser bundle: every commit
 * on main since the release touches assets/js/scolta.js, assets/css/scolta.css
 * and the changelog, and nothing under src/.
 *
 * Runs after `scolta-build assets`, so it overwrites the release bundle the
 * CLI just copied. WASM and the Pagefind runtime are left as the CLI copied
 * them: they are identical in both revisions, and re-copying them would only
 * widen what this script is responsible for.
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(root, "node_modules", "scolta-dev-bundle", "assets");
const to = join(root, "public", "scolta");

if (!existsSync(from)) {
  console.error(
    "[scolta] scolta-dev-bundle is not installed; the served bundle would be the released one, without setSuggestionRenderer.",
  );
  process.exit(1);
}

for (const [src, dest] of [
  ["js/scolta.js", "js/scolta.js"],
  ["css/scolta.css", "css/scolta.css"],
]) {
  const source = join(from, src);
  const target = join(to, dest);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
  console.log(`[scolta] dev bundle: ${dest}`);
}
