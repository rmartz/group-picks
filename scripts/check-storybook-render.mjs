#!/usr/bin/env node
/**
 * Canary render guard for the BUILT Storybook.
 *
 * Serves the pre-built static Storybook (`storybook-static/`) and renders a few
 * Redux-connected stories in real Chromium, asserting each mounts. This guards
 * the production `storybook build` render path — the one that neither
 * `Storybook Tests` (vitest, dev transform via esbuild) nor the compile-only
 * `pnpm build-storybook` exercises.
 *
 * It exists to catch the Vite 8 / Rolldown tree-shaking regression that drops
 * `reselect` from the built bundle (reselect declares `sideEffects: false`;
 * Rolldown tree-shakes it away — https://github.com/vitejs/rolldown-vite/issues/608),
 * so Redux Toolkit's internal `createSelectorCreator(...)` is undefined and every
 * Redux-connected story crashes with `createSelectorCreator is not defined`. Vite
 * 7 (Rollup) doesn't have this bug. The guard is RED while the regression is
 * present and GREEN once the bundler stops dropping reselect — a watchdog for the
 * Dependabot attempt to return to Vite 8.
 *
 * Build Storybook first (`pnpm build-storybook`). Exits 0 if all canaries render,
 * 1 otherwise.
 */

import { existsSync, readFileSync } from "fs";
import { readFile } from "fs/promises";
import http from "http";
import { extname, join, normalize } from "path";
import { chromium } from "playwright";

const staticDir = "storybook-static";
const indexPath = join(staticDir, "index.json");

// Redux-connected stories that pull the RTK/reselect path into the built bundle.
// Confirmed to crash on Vite 8 and render on Vite 7. If one is renamed or
// removed, update this list (the guard fails loudly if a canary id is missing).
const CANARY_STORY_IDS = [
  "groups-groupdetailview--default",
  "picks-pickdetailview--open-pick",
];
const RENDER_TIMEOUT_MS = 10000;

if (!existsSync(indexPath)) {
  console.error(
    `error: ${indexPath} not found — run \`pnpm build-storybook\` first.`,
  );
  process.exit(1);
}

const entries = JSON.parse(readFileSync(indexPath, "utf8")).entries ?? {};
const missing = CANARY_STORY_IDS.filter((id) => !entries[id]);
if (missing.length > 0) {
  console.error(
    `error: canary story id(s) not in the built Storybook index — update CANARY_STORY_IDS in this script: ${missing.join(", ")}`,
  );
  process.exit(1);
}

const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".map": "application/json",
  ".mjs": "text/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const filePath = join(
      staticDir,
      normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, ""),
    );
    const resolved = urlPath.endsWith("/")
      ? join(filePath, "index.html")
      : filePath;
    const data = await readFile(resolved);
    res.writeHead(200, {
      "Content-Type":
        contentTypes[extname(resolved)] ?? "application/octet-stream",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();

const browser = await chromium.launch();
let failed = 0;

for (const id of CANARY_STORY_IDS) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const url = `http://127.0.0.1:${port}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`;
  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: RENDER_TIMEOUT_MS,
    });
    await page
      .locator("#storybook-root > *")
      .first()
      .waitFor({ state: "visible", timeout: RENDER_TIMEOUT_MS });
    console.log(`ok: ${id} rendered`);
  } catch (error) {
    const hint = errors.find((message) => /is not defined/.test(message));
    console.error(
      `FAIL: ${id} did not render in the built Storybook: ${error.message}` +
        (hint ? `\n    (console error: ${hint})` : ""),
    );
    failed += 1;
  } finally {
    await page.close();
  }
}

await browser.close();
await new Promise((resolve) => server.close(resolve));

if (failed > 0) {
  console.error(
    `\n${failed}/${CANARY_STORY_IDS.length} canary story(ies) failed to render in the built Storybook — likely the Vite 8 / Rolldown reselect tree-shaking regression. Stay on Vite 7 until this is green.`,
  );
  process.exit(1);
}
console.log(
  `\nAll ${CANARY_STORY_IDS.length} canary stories rendered in the built Storybook.`,
);
process.exit(0);
