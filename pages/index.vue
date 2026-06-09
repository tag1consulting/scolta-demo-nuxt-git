<script setup lang="ts">
// Home page: hero + Scolta search + section grid. The search widget lives in the
// home main content (parity with the Drupal/Django demos), not the header.
const { data: meta } = await useFetch("/api/sections");
const { data: browserConfig } = await useFetch("/api/scolta-config");
</script>

<template>
  <div>
    <article class="prose hero">
      <h1>GitMastery</h1>
      <p>Master Git with {{ meta?.count }} pages of reference docs in five languages.</p>
      <p class="hero__hint">
        Try searching: <em>undo my last commit</em>, <em>how to delete a branch</em>,
        <em>slow git</em>.
      </p>
    </article>

    <div class="home-search">
      <ClientOnly>
        <ScoltaSearch
          v-if="browserConfig"
          :config="browserConfig"
          assets-path="/scolta"
          pagefind-path="/pagefind/pagefind.js"
        />
      </ClientOnly>
    </div>

    <div class="section-grid">
      <section v-for="s in meta?.nav ?? []" :key="s.section" class="section-card">
        <h2>{{ s.section }}</h2>
        <p class="section-card__count">{{ s.pages.length }} page(s)</p>
        <ul>
          <li v-for="p in s.pages.slice(0, 6)" :key="p.url">
            <NuxtLink :to="p.url">{{ p.title }}</NuxtLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
