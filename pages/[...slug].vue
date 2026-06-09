<script setup lang="ts">
const route = useRoute();
const slug = Array.isArray(route.params.slug) ? route.params.slug.join("/") : String(route.params.slug);
const { data: page, error } = await useFetch(`/api/doc/${slug}`);

// Unknown slug -> 404 (parity with the Next demo's notFound() and the
// Drupal/Django demos): /api/doc throws 404 for a missing page; surface that as
// the page's own response status instead of rendering a blank 200.
if (error.value || !page.value) {
  throw createError({ statusCode: 404, statusMessage: "Page not found" });
}

const showMeta = computed(
  () => page.value && page.value.type !== "about" && (page.value.section || page.value.difficulty || page.value.gitVersion),
);
</script>

<template>
  <article v-if="page" class="prose" :class="page.type" :lang="page.language">
    <h1>{{ page.title }}</h1>
    <div v-if="showMeta" class="doc-meta">
      <span v-if="page.section" class="badge badge--section">{{ page.section }}</span>
      <span v-if="page.difficulty" class="badge badge--difficulty">{{ page.difficulty }}</span>
      <span v-if="page.gitVersion" class="badge badge--version">Git {{ page.gitVersion }}</span>
    </div>
    <div v-html="page.body" />
  </article>
</template>
