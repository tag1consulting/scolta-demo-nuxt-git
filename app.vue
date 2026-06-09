<script setup lang="ts">
// Sidebar nav + translatable slugs come from the build-time content manifest via
// the /api/sections server route (useFetch runs it in-process during SSR and
// replays the payload on hydration).
const { data: meta } = await useFetch("/api/sections");

// SAVED browser config for the header search widget (parity with the Drupal /
// Django demos: search lives in the header on every page, not just the home page).
const { data: browserConfig } = await useFetch("/api/scolta-config");

// Derive the active content language from the current route — EN at /<slug>/,
// translations at /<lang>/<slug>/ — and inject it as a top-level
// `currentLanguage` so scolta.js locks results + AI to that page's language.
// Recomputed on every route change so the lock follows navigation.
const TRANSLATION_LANGS = new Set(["es", "fr", "it", "de"]);
const route = useRoute();
const currentLanguage = computed(() => {
  const seg = route.path.replace(/^\/|\/$/g, "").split("/").filter(Boolean)[0];
  return seg && TRANSLATION_LANGS.has(seg) ? seg : "en";
});
const searchConfig = computed(() =>
  browserConfig.value ? { ...browserConfig.value, currentLanguage: currentLanguage.value } : null,
);
</script>

<template>
  <div>
    <a class="skip-link" href="#main">Skip to main content</a>

    <header class="site-header">
      <div class="site-header__inner">
        <a class="site-brand" href="/">
          <span class="site-brand__mark">⎇</span>
          <span class="site-brand__name">GitMastery</span>
        </a>
        <div class="site-search">
          <ClientOnly>
            <ScoltaSearch
              v-if="searchConfig"
              :key="currentLanguage"
              :config="searchConfig"
              assets-path="/scolta"
              pagefind-path="/pagefind/pagefind.js"
            />
          </ClientOnly>
        </div>
        <LanguageSwitcher :translatable="meta?.translatable ?? []" />
      </div>
    </header>

    <div class="layout">
      <SidebarNav :sections="meta?.nav ?? []" />
      <main id="main" class="content">
        <NuxtPage />
      </main>
    </div>

    <footer class="site-footer">
      <p>
        GitMastery is a fictional demo by <a href="https://tag1.com">Tag1 Consulting</a>,
        showcasing <a href="https://tag1.com/scolta">Scolta</a> AI search on Nuxt.
      </p>
    </footer>
  </div>
</template>
