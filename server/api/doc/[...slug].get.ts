import { createError, defineEventHandler, getRouterParam } from "h3";
import { manifestPageBySlugSegments } from "../../../lib/manifest";

// Page-by-slug lookup from the build-time content manifest (bundled into the
// server) — no request-time filesystem read, so every doc page resolves
// regardless of the Nitro process working directory.
export default defineEventHandler((event) => {
  const slug = (getRouterParam(event, "slug") ?? "").split("/").filter(Boolean);
  const page = manifestPageBySlugSegments(slug);
  if (!page) throw createError({ statusCode: 404, statusMessage: "Not found" });
  return page;
});
