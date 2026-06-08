import { defineEventHandler } from "h3";
import { loadEnglishDocs } from "../../lib/content";

export default defineEventHandler(() => {
  const docs = loadEnglishDocs();
  return {
    count: docs.length,
    sections: [...new Set(docs.map((d) => d.section))].filter(Boolean),
  };
});
