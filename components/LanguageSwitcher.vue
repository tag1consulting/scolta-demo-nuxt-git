<script setup lang="ts">
/**
 * Header language switcher (parity with the Django/Drupal `.language-switcher`).
 * Derives per-language URLs from the current route: EN at /<slug>/, translations
 * at /<lang>/<slug>/. Translation links are shown only for translatable doc
 * pages (the About/home pages exist in English only). Collapses to a trigger
 * button on narrow viewports — the Vue port of theme/js/lang-switcher.js.
 */
const props = defineProps<{ translatable: string[] }>();

const LANGS = ["en", "de", "es", "fr", "it"] as const;
const TRANSLATION_LANGS = new Set(["es", "fr", "it", "de"]);

const route = useRoute();

const parsed = computed(() => {
  const segments = route.path.replace(/^\/|\/$/g, "").split("/").filter(Boolean);
  if (segments.length > 0 && TRANSLATION_LANGS.has(segments[0]!)) {
    return { lang: segments[0]!, slug: segments.slice(1).join("/") };
  }
  return { lang: "en", slug: segments.join("/") };
});

const hasTranslations = computed(
  () => parsed.value.slug !== "" && props.translatable.includes(parsed.value.slug),
);
const langs = computed<readonly string[]>(() => (hasTranslations.value ? LANGS : ["en"]));

function urlFor(code: string): string {
  const { slug } = parsed.value;
  return code === "en" ? `/${slug}/` : `/${code}/${slug}/`;
}

const open = ref(false);
const root = ref<HTMLElement | null>(null);

function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false;
}
function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") open.value = false;
}
onMounted(() => {
  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onKey);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
  document.removeEventListener("keydown", onKey);
});
</script>

<template>
  <nav ref="root" class="language-switcher" :class="{ 'is-open': open }" aria-label="Language">
    <button
      type="button"
      class="lang-trigger"
      :aria-expanded="open"
      @click.stop="open = !open"
    >
      {{ parsed.lang.toUpperCase() }}
    </button>
    <ul class="language-switcher__list">
      <li v-for="code in langs" :key="code" :class="{ 'is-active': code === parsed.lang }">
        <a :href="urlFor(code)" :hreflang="code" :aria-current="code === parsed.lang ? 'true' : undefined">
          {{ code.toUpperCase() }}
        </a>
      </li>
    </ul>
  </nav>
</template>
