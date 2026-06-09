<script setup lang="ts">
// Home page: hero + section grid. The search widget lives in the global header
// (app.vue) on every page now, not in the home main content.
const { data: meta } = await useFetch("/api/sections");
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

    <div class="section-grid">
      <section v-for="s in meta?.nav ?? []" :key="s.section" class="section-card">
        <h2>{{ s.section }}</h2>
        <p class="section-card__count">{{ s.pages.length }} page(s)</p>
        <ul>
          <li v-for="p in s.pages.slice(0, 6)" :key="p.url">
            <a :href="p.url">{{ p.title }}</a>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
