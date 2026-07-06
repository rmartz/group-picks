#!/usr/bin/env node

// Capture a PNG per Storybook story from a static build, using the Chromium that
// the workflow already installs for Storybook Tests (no separate install owned
// by the screenshots step). Self-hosted replacement for the third-party
// auto-pr-screenshots action — see #339.
//
// Usage:
//   node scripts/capture-screenshots.mjs \
//     --static-dir=storybook-static \
//     --out=screenshots \
//     [--changed-files=changed-files.txt]   # only capture stories in these files
//
// With --changed-files, only stories whose source file appears in that list are
// captured (the intended visual change). Without it, every story is captured.

import { createReadStream, existsSync, mkdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

export function parseArgs(argv) {
  const args = { staticDir: "storybook-static", out: "screenshots" };
  for (const arg of argv) {
    if (arg.startsWith("--static-dir=")) args.staticDir = arg.slice(13);
    else if (arg.startsWith("--out=")) args.out = arg.slice(6);
    else if (arg.startsWith("--changed-files="))
      args.changedFiles = arg.slice(16);
  }
  return args;
}

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".ico": "image/x-icon",
  ".map": "application/json",
};

function startStaticServer(rootDir) {
  const server = createServer((req, res) => {
    // Ignore the query string (Storybook reads ?id=… client-side from iframe.html).
    const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
    const rel = normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
    let filePath = join(rootDir, rel);
    if (urlPath.endsWith("/")) filePath = join(filePath, "index.html");
    if (!existsSync(filePath)) {
      res.statusCode = 404;
      res.end("not found");
      return;
    }
    res.setHeader(
      "Content-Type",
      MIME[extname(filePath)] ?? "application/octet-stream",
    );
    createReadStream(filePath).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

// The `story`-typed entries of a Storybook `index.json` (docs entries and other
// non-story types are dropped — only stories yield a screenshot).
export function storiesFromIndex(index) {
  return Object.values(index.entries).filter((e) => e.type === "story");
}

// Keep only stories whose source file appears in `changedFiles`. `importPath`
// looks like "./src/foo/Bar.stories.tsx" while changed-files entries are
// repo-relative ("src/foo/Bar.stories.tsx"), so the leading "./" is stripped
// before comparison.
export function filterStoriesByChangedFiles(stories, changedFiles) {
  const changed = new Set(changedFiles);
  return stories.filter((e) => changed.has(e.importPath.replace(/^\.\//, "")));
}

// Parse the newline-delimited changed-files list, trimming each line and
// dropping blanks.
export function parseChangedFiles(contents) {
  return contents
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function selectStories(staticDir, changedFilesPath) {
  const index = JSON.parse(readFileSync(join(staticDir, "index.json"), "utf8"));
  const stories = storiesFromIndex(index);

  if (!changedFilesPath || !existsSync(changedFilesPath)) return stories;

  const changedFiles = parseChangedFiles(
    readFileSync(changedFilesPath, "utf8"),
  );
  return filterStoriesByChangedFiles(stories, changedFiles);
}

// Wall-clock budget for the whole capture, kept below the job's timeout-minutes
// so an overrun exits non-zero (a FAILURE routed to fix-review) rather than
// letting the job hit its timeout and be CANCELLED (which requires human
// escalation). Overridable via CAPTURE_DEADLINE_MS for local testing.
const DEFAULT_DEADLINE_MS = 240_000;
// Per-story budgets: navigate to first paint (not networkidle, which can hang on
// a page that keeps requesting), then give the story a short window to mount. A
// story that crashes on render leaves #storybook-root empty and fails within
// RENDER_TIMEOUT_MS instead of dragging the whole run toward the job timeout.
const NAV_TIMEOUT_MS = 15_000;
const RENDER_TIMEOUT_MS = 4_000;
const CONCURRENCY = 4;

// Resolve the wall-clock deadline from the environment, falling back to the
// default when unset or not a positive number.
export function resolveDeadlineMs(env) {
  const parsed = Number(env?.CAPTURE_DEADLINE_MS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DEADLINE_MS;
}

async function captureStory(context, port, outDir, story) {
  const url = `http://127.0.0.1:${port}/iframe.html?id=${story.id}&viewMode=story`;
  const page = await context.newPage();
  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: NAV_TIMEOUT_MS,
    });
    await page
      .locator("#storybook-root > *")
      .first()
      .waitFor({ state: "attached", timeout: RENDER_TIMEOUT_MS });
    await page.screenshot({ path: join(outDir, `${story.id}.png`) });
  } finally {
    await page.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const stories = selectStories(args.staticDir, args.changedFiles);

  if (stories.length === 0) {
    console.log("No matching stories to capture.");
    return;
  }
  mkdirSync(args.out, { recursive: true });

  const deadlineMs = resolveDeadlineMs(process.env);
  const startedAt = Date.now();
  const { server, port } = await startStaticServer(args.staticDir);
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const queue = [...stories];
  const failed = [];
  let captured = 0;
  let deadlineHit = false;

  async function worker() {
    while (queue.length > 0) {
      if (Date.now() - startedAt > deadlineMs) {
        deadlineHit = true;
        return;
      }
      const story = queue.shift();
      try {
        await captureStory(context, port, args.out, story);
        captured += 1;
        console.log(`captured ${story.id}`);
      } catch (err) {
        failed.push(story.id);
        console.warn(`FAILED ${story.id}: ${err.message}`);
      }
    }
  }

  try {
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, stories.length) }, worker),
    );
  } finally {
    await browser.close();
    server.close();
  }

  console.log(
    `Captured ${captured}/${stories.length} screenshot(s) to ${args.out}/`,
  );

  // Exit non-zero on a deadline overrun or any render failure, so the problem is
  // surfaced as a job FAILURE (→ fix-review) rather than silently skipped or left
  // to time out and be cancelled. The job is advisory (job-level
  // continue-on-error), so this failure is non-blocking for the run.
  if (deadlineHit) {
    console.error(
      `Capture exceeded its ${deadlineMs}ms deadline with ${queue.length} unrendered — failing fast instead of timing out.`,
    );
    process.exit(1);
  }
  if (failed.length > 0) {
    console.error(
      `${failed.length} stor${failed.length === 1 ? "y" : "ies"} failed to render: ${failed.join(", ")}`,
    );
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
