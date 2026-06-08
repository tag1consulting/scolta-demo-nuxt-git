// Minimal config the `scolta-build` CLI reads (it can't import the TS config in
// lib/config.ts). This content-mode demo serves the index from public/, so the
// CLI's `assets` subcommand must copy the runtime bundle into public/scolta to
// sit alongside public/pagefind. The full Scolta config lives in lib/config.ts.
export default { outputDir: "public", assetsPublicPath: "/scolta" };
