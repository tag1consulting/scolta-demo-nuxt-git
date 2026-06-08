import { scoltaConfigInit } from "./lib/config";

// GitMastery (Nuxt) — registers the scolta-nuxt module (Nitro AI routes at
// /api/scolta/v1/* + the <ScoltaSearch> component) with the demo's Scolta config.
export default defineNuxtConfig({
  modules: ["scolta-nuxt"],
  scolta: scoltaConfigInit,
  nitro: { preset: "node-server" },
});
