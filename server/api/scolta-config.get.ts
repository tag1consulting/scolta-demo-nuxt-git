import { defineEventHandler } from "h3";
import { getConfig } from "../../lib/config";

// Resolve the SAVED browser config server-side only. getConfig() pulls in the
// `scolta` binding (node:crypto, node:fs), which must never reach the client
// bundle — so app.vue fetches this route instead of importing the config
// directly. This mirrors how the Next demo keeps config resolution in a React
// Server Component.
export default defineEventHandler(() => getConfig().toBrowserConfig());
