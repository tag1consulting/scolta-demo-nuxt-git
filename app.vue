<script setup lang="ts">
// Sidebar nav + translatable slugs come from the build-time content manifest via
// the /api/sections server route (useFetch runs it in-process during SSR and
// replays the payload on hydration).
const { data: meta } = await useFetch("/api/sections");
</script>

<template>
  <div>
    <a class="skip-link" href="#main">Skip to main content</a>

    <header class="site-header">
      <div class="site-header__inner">
        <NuxtLink class="site-brand" to="/">
          <span class="site-brand__mark">⎇</span>
          <span class="site-brand__name">GitMastery</span>
        </NuxtLink>
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
