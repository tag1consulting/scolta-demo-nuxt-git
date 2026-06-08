# GitMastery (Nuxt) — Multilingual Git Documentation Site

A comprehensive Git documentation site built on **Nuxt 3**, showcasing
[Scolta](https://tag1consulting.com/scolta) AI-powered search across **1,426
pages in 5 languages** (EN/ES/FR/IT/DE).

The Vue/Nuxt sibling of the Drupal [`git-manual`](../git-manual), Django
[`git-manual-django`](../git-manual-django), and Next.js
[`git-manual-next`](../git-manual-next) demos, on the
[`scolta`](../../packages/scolta-node) binding + [`scolta-nuxt`](../../packages/scolta-nuxt)
module. Same corpus, same five languages, same Scolta config, and
**URL-compatible slugs** with all the other demos.

## Content

`content/` is the identical YAML corpus: 285 English docs + 1 About, each
translated into es/fr/it/de — 1,426 indexable pages (see `SOURCES.md`). URLs
match the other demos: EN at `/<slug>/` (Django-compatible `slugify(title)`),
translations at `/<lang>/<slug>/`, About at `/about/`.

## Quick start

```bash
npm install --legacy-peer-deps
npm run dev                # dev server at http://localhost:3000
# or a server build:
npm run build              # nuxt build (postbuild copies assets + builds index)
```

`postbuild` runs `scolta:assets` (copies the vendored runtime bundle into
`public/scolta/`) and `scolta:build` (writes the index to `public/pagefind/`,
content mode); run them individually with `npm run scolta:assets` /
`npm run scolta:build`. Set `SCOLTA_API_KEY=sk-ant-...` for live AI overviews;
search works without it.

## How it works

- `nuxt.config.ts` registers the **scolta-nuxt** module, which mounts the AI
  endpoints as Nitro routes at `/api/scolta/v1/*` and auto-registers
  `<ScoltaSearch>`. The demo's Scolta config is passed via the `scolta` key.
- `lib/content.ts` — the same content loader as the Next demo (js-yaml +
  Django-parity slugs/URLs).
- `lib/source.ts` / `lib/config.ts` — the Scolta content source + config
  (`reference` preset, five languages, facet filters), shared by the build and
  the module. No indexing/scoring logic lives here — it is all in `scolta`.
- `server/api/*` Nitro routes serve page content (the loader runs server-only).

## Tests

```bash
npm test          # content parity, URL derivation, content source, full
                  # 1,426-page index build (5 language facets), config, handlers
npm run typecheck # tsc on the Scolta integration (lib)
npm run lint
```
