<script setup lang="ts">
// Resolve the SAVED browser config from a server route — getConfig() loads the
// `scolta` binding (node:crypto/fs), which must not be bundled into the client.
// useFetch runs the handler in-process during SSR and replays the payload on
// hydration, so the binding only ever executes on the server.
const { data: browserConfig } = await useFetch("/api/scolta-config");
</script>

<template>
  <div>
    <header style="padding: 1rem; border-bottom: 1px solid #ddd">
      <NuxtLink to="/"><strong>GitMastery</strong></NuxtLink>
      <ClientOnly>
        <ScoltaSearch
          v-if="browserConfig"
          :config="browserConfig"
          assets-path="/scolta"
          pagefind-path="/pagefind/pagefind.js"
        />
      </ClientOnly>
    </header>
    <main style="max-width: 820px; margin: 0 auto; padding: 1rem">
      <NuxtPage />
    </main>
  </div>
</template>
