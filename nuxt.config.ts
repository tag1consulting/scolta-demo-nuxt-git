import { scoltaConfigInit } from "./lib/config";

// GitMastery (Nuxt) — registers the scolta-nuxt module (Nitro AI routes at
// /api/scolta/v1/* + the <ScoltaSearch> component) with the demo's Scolta config.
export default defineNuxtConfig({
  modules: ["scolta-nuxt"],
  scolta: scoltaConfigInit,
  nitro: { preset: "node-server" },
  css: ["~/assets/css/gitmastery.css"],
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap",
        },
      ],
    },
  },
});
