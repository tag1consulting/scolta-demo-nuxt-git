import { defineEventHandler } from "h3";
import {
  manifestCount,
  manifestNav,
  manifestSections,
  manifestTranslatable,
} from "../../lib/manifest";

// Resolves from the build-time content manifest (bundled into the server), not a
// request-time filesystem read — so the count and sections are correct
// regardless of the Nitro process working directory.
export default defineEventHandler(() => ({
  count: manifestCount(),
  sections: manifestSections(),
  nav: manifestNav(),
  translatable: manifestTranslatable(),
}));
