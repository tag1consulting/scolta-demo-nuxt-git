import { createError, defineEventHandler, getRouterParam } from "h3";
import { pageBySlugSegments } from "../../../lib/content";

export default defineEventHandler((event) => {
  const slug = (getRouterParam(event, "slug") ?? "").split("/").filter(Boolean);
  const page = pageBySlugSegments(slug);
  if (!page) throw createError({ statusCode: 404, statusMessage: "Not found" });
  return page;
});
