#!/usr/bin/env bash
#
# Smoke test.
#
# Builds the app the way a deployment does, serves the build, and asserts:
#   1. the site root returns a 2xx,
#   2. the search API returns a 2xx,
#   3. the Pagefind index metadata is served,
#   4. the index reports at least MIN_PAGES pages,
#   5. a deep content page returns a 2xx.
#
# Two notes on why this script looks the way it does.
#
# First, every status assertion requires a success code. The sibling demos
# learned this the hard way: a version of their test treated any response other
# than the curl failure code 000 as liveness, so a site returning HTTP 500 on
# every request still passed. A test that cannot fail on a broken site is worse
# than no test, because every later run inherits the false confidence.
#
# Second, assertion 5 is not redundant with assertion 1. The root renders from
# the nav; the 1,426 doc pages come from the catch-all route, which reads the
# YAML corpus through lib/content.ts. That loader is what broke on the js-yaml 5
# bump, and a corpus that half-loads is a demo with a fine-looking front page and
# no content behind it. The translated page is asked for separately because
# translations are where the corpus problems have actually turned up.
#
# Third, the index and asset assertions are served over HTTP rather than read off
# disk on purpose, and that is what caught a real bug. The Scolta assets and the
# Pagefind index used to be generated in `postbuild`, after `nuxt build` had
# already snapshotted public/ into .output/public and baked its public-asset
# manifest. Nitro serves only what is in that manifest, so a fresh clone built
# once served 404s for /scolta/* and /pagefind/*: no search index at all. It went
# unnoticed because a tree that has already built has the files in public/ when
# the next build snapshots them, so a second build looks fine. Generating them in
# `prebuild` fixes the ordering, and checking them over HTTP is what keeps it
# fixed: reading the files off public/ would pass either way.
set -euo pipefail

PORT="${PORT:-8080}"
MIN_PAGES=1400
SERVER_PID=""

BASE_URL="http://127.0.0.1:${PORT}"
SEARCH_API_URL="${BASE_URL}/api/scolta/v1/health"
PAGEFIND_ENTRY_URL="${BASE_URL}/pagefind/pagefind-entry.json"
DOC_URL="${BASE_URL}/what-is-git-and-what-isnt-it/"
TRANSLATED_DOC_URL="${BASE_URL}/de/what-is-git-and-what-isnt-it/"

cd "$(dirname "$0")/.."

SERVER_LOG="$(mktemp -t nuxt-smoke-XXXXXX.log)"

cleanup() {
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -f "$SERVER_LOG"
}
trap cleanup EXIT

echo "==> Installing dependencies..."
npm ci

echo "==> Building (this also copies the Scolta assets and builds the index)..."
npm run build

echo "==> Starting the server on port $PORT..."
PORT="$PORT" HOST=127.0.0.1 node .output/server/index.mjs > "$SERVER_LOG" 2>&1 &
SERVER_PID=$!

# Poll a URL until it returns a 2xx, following redirects. Prints the last status
# code seen. Returns non-zero if no 2xx arrived before the timeout, so the caller
# can tell "never came up" (000) from "came up broken" (5xx).
await_success() {
  local url="$1" tries="${2:-45}" code="000"
  for _ in $(seq 1 "$tries"); do
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
      echo "$code"
      return 1
    fi
    code=$(curl -sS -L --max-redirs 5 -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    case "$code" in
      2*) echo "$code"; return 0 ;;
    esac
    sleep 2
  done
  echo "$code"
  return 1
}

# Explain a terminal status, then dump the server log and fail.
fail_status() {
  local what="$1" url="$2" code="$3"
  echo "FAIL: $what did not return a success status (last seen: HTTP $code) at $url"
  case "$code" in
    000) echo "      No HTTP response at all: the server never served a request." ;;
    5*)  echo "      A 5xx means the server answered but the app cannot serve the page." \
              "This is a broken demo, not a slow one." ;;
    4*)  echo "      A 4xx means the route is not being served as expected." ;;
  esac
  echo "      --- server log (last 40 lines) ---"
  tail -40 "$SERVER_LOG"
  exit 1
}

echo "==> Waiting for the site root to return a success status (up to 90s)..."
ROOT_CODE=$(await_success "${BASE_URL}/") || fail_status "site root" "${BASE_URL}/" "$ROOT_CODE"
echo "PASS: site root returned HTTP $ROOT_CODE"

echo "==> Checking the search API..."
SEARCH_CODE=$(await_success "$SEARCH_API_URL" 15) || fail_status "search API" "$SEARCH_API_URL" "$SEARCH_CODE"
echo "PASS: search API returned HTTP $SEARCH_CODE"

echo "==> Checking a doc page and a translated doc page..."
DOC_CODE=$(await_success "$DOC_URL" 15) || fail_status "doc page" "$DOC_URL" "$DOC_CODE"
echo "PASS: doc page returned HTTP $DOC_CODE"
TRANSLATED_CODE=$(await_success "$TRANSLATED_DOC_URL" 15) \
  || fail_status "translated doc page" "$TRANSLATED_DOC_URL" "$TRANSLATED_CODE"
echo "PASS: translated doc page returned HTTP $TRANSLATED_CODE"

# The runtime the search widget loads. It reaches the served site only if it was
# in public/ before `nuxt build` snapshotted it, so a 404 here means the build
# produced assets the deployed site cannot use.
echo "==> Checking the Scolta runtime assets..."
RUNTIME_CODE=$(await_success "${BASE_URL}/scolta/js/scolta.js" 10) \
  || fail_status "Scolta runtime asset (not in Nitro's public-asset manifest)" \
       "${BASE_URL}/scolta/js/scolta.js" "$RUNTIME_CODE"
echo "PASS: Scolta runtime asset returned HTTP $RUNTIME_CODE"

echo "==> Verifying search index..."
META_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PAGEFIND_ENTRY_URL" 2>/dev/null || true)
if [ "$META_CODE" != "200" ]; then
  echo "FAIL: Pagefind index metadata not found at $PAGEFIND_ENTRY_URL (HTTP $META_CODE)"
  tail -20 "$SERVER_LOG"
  exit 1
fi
echo "PASS: Pagefind index metadata served (HTTP 200)"

PAGE_COUNT=$(curl -s "$PAGEFIND_ENTRY_URL" | node -e "
let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  try {
    const d = JSON.parse(raw);
    const counts = Object.values(d.languages || {}).map((l) => l.page_count);
    console.log(counts.length ? Math.max(...counts) : 0);
  } catch {
    console.log(0);
  }
});
")

if [ "$PAGE_COUNT" -lt "$MIN_PAGES" ]; then
  echo "FAIL: Only $PAGE_COUNT pages indexed (minimum: $MIN_PAGES)"
  exit 1
fi
echo "PASS: $PAGE_COUNT pages indexed (minimum: $MIN_PAGES)"

echo "==> ALL SMOKE TESTS PASSED"
