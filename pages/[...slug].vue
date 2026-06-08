<script setup lang="ts">
const route = useRoute();
const slug = Array.isArray(route.params.slug) ? route.params.slug.join("/") : String(route.params.slug);
const { data: page } = await useFetch(`/api/doc/${slug}`);
</script>

<template>
  <article v-if="page" :lang="page.language">
    <h1>{{ page.title }}</h1>
    <p v-if="page.section"><em>{{ page.section }} · {{ page.difficulty }}</em></p>
    <div v-html="page.body" />
  </article>
</template>
