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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const stories = selectStories(args.staticDir, args.changedFiles);

  if (stories.length === 0) {
    console.log("No matching stories to capture.");
    return;
  }
  mkdirSync(args.out, { recursive: true });

  const { server, port } = await startStaticServer(args.staticDir);
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });

  let captured = 0;
  try {
    for (const story of stories) {
      const url = `http://127.0.0.1:${port}/iframe.html?id=${story.id}&viewMode=story`;
      // One flaky story must not abort the whole (advisory) capture.
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 20_000 });
        // Wait for the story root to actually render content.
        await page
          .locator("#storybook-root > *")
          .first()
          .waitFor({ state: "attached", timeout: 15_000 });
        await page.screenshot({ path: join(args.out, `${story.id}.png`) });
        captured += 1;
        console.log(`captured ${story.id}`);
      } catch (err) {
        console.warn(`skipped ${story.id}: ${err.message}`);
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(
    `Captured ${captured}/${stories.length} screenshot(s) to ${args.out}/`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
