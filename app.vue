<script setup lang="ts">
import { getConfig } from "./lib/config";
// Resolve the SAVED browser config on the server and pass it to the widget.
const browserConfig = getConfig().toBrowserConfig();
</script>

<template>
  <div>
    <header style="padding: 1rem; border-bottom: 1px solid #ddd">
      <NuxtLink to="/"><strong>GitMastery</strong></NuxtLink>
      <ClientOnly>
        <ScoltaSearch :config="browserConfig" assets-path="/scolta" pagefind-path="/pagefind/pagefind.js" />
      </ClientOnly>
    </header>
    <main style="max-width: 820px; margin: 0 auto; padding: 1rem">
      <NuxtPage />
    </main>
  </div>
</template>
