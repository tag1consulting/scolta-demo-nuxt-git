# GitMastery (Nuxt) — Content Sources and Provenance

This demo is the Nuxt 3 port of the Drupal `git-manual` demo. The content
corpus in `content/` is identical to the Drupal demo's `import/` YAML.

## Content Sources

All Git documentation content is derived from and inspired by publicly available Git documentation:

- **Git official documentation**: https://git-scm.com/docs — authoritative reference for all commands, flags, and behavior. Licensed under GPLv2.
- **Git Book (Pro Git)**: https://git-scm.com/book — Scott Chacon & Ben Straub, CC BY-NC-SA 3.0. Source for conceptual explanations and workflows.
- **Git man pages**: `git help <command>` — canonical command reference.
- **kernel.org Git documentation**: https://git.kernel.org/pub/scm/git/git.git/tree/Documentation — technical internals.
- **Git mailing list archives**: design decisions, performance work, internals.

Technical content for the Performance section draws from Derrick Stolee's writings on commit-graph / MIDX / Bloom filters, Scalar documentation, and Git maintenance / partial-clone design docs.

## Content Generation

**English pages (285):** AI-generated (Claude, Anthropic) based on the above sources, written to accurately reflect real Git behavior; commands and flags verified against Git 2.30+ documentation; version-specific features labeled with their introducing version.

**Translations (×4 languages):** AI-generated translations using Claude (Anthropic):
- Spanish (es): natural, professional Spanish for developers
- French (fr): idiomatic French technical writing
- Italian (it): natural Italian with English technical terms preserved
- German (de): formal register for German technical documentation

Translation conventions: Git commands/flags/option names stay in English; common as-is technical terms (commit, push, pull, merge, rebase, branch, stash, fork, patch, blob, tree, hash, reflog, worktree, checkout, fetch) stay in English; code block contents stay in English; all prose, headings, and explanatory text are fully translated. A human review pass is recommended before production use.

## Tools Used

- **Nuxt 3** — Vue web framework. https://nuxt.com
- **scolta** — the Scolta Node/TypeScript binding + in-process pure-TypeScript Pagefind indexer.
- **scolta-nuxt** — the Scolta Nuxt module (Nitro AI routes + `<ScoltaSearch>` component).
- **Pagefind** — static client-side search index (built in-process by the pure-TypeScript indexer). https://pagefind.app
- **Claude (Anthropic)** — AI assistant for content generation, translation, and runtime query expansion / overviews.

## Scolta Integration

This site is a demonstration dataset for the Scolta search-quality platform. The 1,426 pages across 5 languages provide a realistic corpus for testing technical documentation search relevance, query expansion and synonym matching, cross-language semantic search, and multi-section navigation. The Scolta configuration is in `lib/config.ts` (shared by the index build and the Nuxt module), with a minimal CLI shim in `scolta.config.mjs`.

## License

The generated documentation content is provided for demonstration purposes. The underlying Git documentation is GPLv2; Pro Git is CC BY-NC-SA 3.0. This generated content should not be used as a replacement for the official Git documentation.

Git is copyright 2005–present by Linus Torvalds and contributors.
