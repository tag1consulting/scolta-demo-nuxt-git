/**
 * Loads GitMastery's Scolta stylesheet, immediately after the bundle's own.
 *
 * <ScoltaSearch> injects `<link rel="stylesheet" href="/scolta/css/scolta.css">`
 * into <head> from its onMounted, appending it after everything already there.
 * So a stylesheet registered through nuxt.config's `css` array or through
 * useHead() is always EARLIER in the document than the one it means to
 * override, and loses every same-specificity redeclaration — including the
 * documented custom properties, which scolta.css sets on :root.
 *
 * Two ways out. Raise specificity (scope every override to #scolta-search) and
 * keep the file in the normal pipeline, or append the link after and keep the
 * selectors flat. This takes the second: Scolta's theming contract is a set of
 * custom properties and single-class hooks, and matching that with an ID
 * selector would be a workaround written into every rule rather than into one
 * place.
 *
 * The ordering is established by watching for the bundle's link rather than by
 * appending at a moment believed to be later. `app:mounted` is not later: this
 * app wraps <ScoltaSearch> in <ClientOnly>, whose subtree mounts after
 * hydration, so a link appended on that hook lands FIRST and loses. That was
 * measured, not assumed — the first version of this plugin did exactly that
 * and --scolta-sayt-z-index still resolved to the bundle's 50.
 *
 * A MutationObserver has no such assumption in it: the link goes in when, and
 * only when, the one it has to follow exists. It disconnects on the first
 * match, and the insert is idempotent, so a hot reload cannot stack
 * duplicates. If the search widget never mounts, nothing is inserted, which is
 * correct: there is nothing on that page for this stylesheet to theme.
 *
 * Client-only by filename: the link this one has to follow does not exist
 * until the browser mounts the app, so there is nothing to do during SSR.
 */
export default defineNuxtPlugin(() => {
  const HREF = "/scolta-search.css";
  const MARKER = "data-gitmastery-scolta";

  function insertAfter(reference: Element): void {
    if (document.querySelector(`link[${MARKER}]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = HREF;
    link.setAttribute(MARKER, "");
    reference.after(link);
  }

  const existing = document.head.querySelector('link[data-scolta][rel="stylesheet"]');
  if (existing) {
    insertAfter(existing);
    return;
  }

  const observer = new MutationObserver(() => {
    const link = document.head.querySelector('link[data-scolta][rel="stylesheet"]');
    if (!link) return;
    observer.disconnect();
    insertAfter(link);
  });
  observer.observe(document.head, { childList: true });
});
