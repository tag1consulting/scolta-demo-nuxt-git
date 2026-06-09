<script setup lang="ts">
/**
 * Documentation section nav (parity with the Django `.sidebar` / `section_nav`).
 * Collapsible <details> per section; the section containing the active page (and
 * the first section) start open, and the active page link is highlighted.
 */
interface NavLink {
  title: string;
  url: string;
}
interface NavSection {
  section: string;
  pages: NavLink[];
}

defineProps<{ sections: NavSection[] }>();

const route = useRoute();
function norm(p: string): string {
  return ("/" + p.replace(/^\/|\/$/g, "") + "/").replace(/\/+/g, "/");
}
const current = computed(() => norm(route.path));
</script>

<template>
  <aside class="sidebar" aria-label="Documentation sections">
    <details
      v-for="(s, i) in sections"
      :key="s.section"
      class="nav-section"
      :open="i === 0 || s.pages.some((p) => norm(p.url) === current)"
    >
      <summary>{{ s.section }}</summary>
      <ul>
        <li v-for="p in s.pages" :key="p.url" :class="{ 'is-active': norm(p.url) === current }">
          <a :href="p.url">{{ p.title }}</a>
        </li>
      </ul>
    </details>
  </aside>
</template>
