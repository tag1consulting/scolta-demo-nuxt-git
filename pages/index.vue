<script setup lang="ts">
const { data } = await useFetch("/api/sections");
</script>

<template>
  <div>
    <h1>GitMastery</h1>
    <p>Master Git with {{ data?.count }} pages of reference docs in five languages.</p>
    <h2>Sections</h2>
    <ul>
      <li v-for="s in data?.sections" :key="s">{{ s }}</li>
    </ul>
    <p><NuxtLink to="/about/">About this demo</NuxtLink></p>
  </div>
</template>
