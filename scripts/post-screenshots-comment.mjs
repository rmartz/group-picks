#!/usr/bin/env node

// Upsert a single sticky PR comment with Before / After Storybook screenshots
// (#339, #403). For each changed story the job publishes two renders to the
// per-PR `gh-screenshots-pr-<N>` branch: `before/<story>.png` (the base/`main`
// render) and `after/<story>.png` (this PR's render). Images are referenced via
// raw.githubusercontent.com (the repo is public). A `?v=<sha>` cache-buster
// makes GitHub's image proxy refetch on each new commit. The comment is found
// and updated by a hidden marker so each run replaces the previous one.
//
// A story present in both renders is shown side by side; a story new in this PR
// (absent from the base index) is shown After-only; a deleted story is
// Before-only.
//
// Usage:
//   node scripts/post-screenshots-comment.mjs \
//     --pr=<number> --branch=<gh-screenshots-pr-N> --sha=<head-sha> \
//     [--before-dir=before] [--after-dir=after]
//
// Requires env: GITHUB_REPOSITORY (owner/repo) and GITHUB_TOKEN.

import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const MARKER = "<!-- storybook-screenshots -->";

function parseArgs(argv) {
  const args = { beforeDir: "before", afterDir: "after" };
  for (const arg of argv) {
    if (arg.startsWith("--pr=")) args.pr = arg.slice(5);
    else if (arg.startsWith("--branch=")) args.branch = arg.slice(9);
    else if (arg.startsWith("--sha=")) args.sha = arg.slice(6);
    else if (arg.startsWith("--before-dir=")) args.beforeDir = arg.slice(13);
    else if (arg.startsWith("--after-dir=")) args.afterDir = arg.slice(12);
  }
  return args;
}

// Extract the `rel="next"` URL from a GitHub `Link` response header, or
// undefined when no next page exists (last page, or header absent).
export function parseNextLink(linkHeader) {
  if (!linkHeader) return undefined;
  const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
  return match ? match[1] : undefined;
}

async function gh(path, method = "GET", body) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(
      `GitHub ${method} ${path} -> ${res.status} ${await res.text()}`,
    );
  }
  return res.json();
}

// Search every page of a PR's comments for the sticky marker, following the
// `Link: rel="next"` header until exhausted (#342). Without this loop only the
// first 100 comments were searched, so a marker beyond page 1 was missed and a
// duplicate comment posted. `fetchFn` is injectable for testing.
export async function findMarkerComment({
  fetchFn = fetch,
  repo,
  pr,
  token,
  marker = MARKER,
}) {
  let url = `https://api.github.com/repos/${repo}/issues/${pr}/comments?per_page=100`;
  while (url) {
    const res = await fetchFn(url, {
      headers: {
        authorization: `Bearer ${token}`,
        accept: "application/vnd.github+json",
      },
    });
    if (!res.ok) {
      throw new Error(`GitHub GET ${url} -> ${res.status} ${await res.text()}`);
    }
    const comments = await res.json();
    const existing = comments.find((c) => c.body?.includes(marker));
    if (existing) return existing;
    url = parseNextLink(res.headers.get("link"));
  }
  return undefined;
}

// Pair the before/after PNG filenames by story id (the filename is
// `<story.id>.png`), producing one sorted entry per story with flags for which
// renders exist. A modified story has both; a new story has only `after`; a
// deleted story has only `before`.
export function pairScreenshots(beforeFiles, afterFiles) {
  const before = new Set(beforeFiles);
  const after = new Set(afterFiles);
  const files = [...new Set([...beforeFiles, ...afterFiles])].sort();
  return files.map((file) => ({
    file,
    name: file.replace(/\.png$/, ""),
    hasBefore: before.has(file),
    hasAfter: after.has(file),
  }));
}

function renderStory(repo, branch, sha, { file, name, hasBefore, hasAfter }) {
  const beforeUrl = `https://raw.githubusercontent.com/${repo}/${branch}/before/${file}?v=${sha}`;
  const afterUrl = `https://raw.githubusercontent.com/${repo}/${branch}/after/${file}?v=${sha}`;

  if (hasBefore && hasAfter) {
    return [
      "<details open>",
      `<summary><code>${name}</code></summary>`,
      "",
      "| Before | After |",
      "| --- | --- |",
      `| ![before](${beforeUrl}) | ![after](${afterUrl}) |`,
      "",
      "</details>",
    ].join("\n");
  }

  const label = hasAfter ? "new" : "removed";
  const alt = hasAfter ? "after" : "before";
  const url = hasAfter ? afterUrl : beforeUrl;
  return [
    "<details open>",
    `<summary><code>${name}</code> — ${label}</summary>`,
    "",
    `![${alt}](${url})`,
    "",
    "</details>",
  ].join("\n");
}

export function buildBody(repo, branch, sha, beforeFiles, afterFiles) {
  const shortSha = sha.slice(0, 7);
  const blocks = pairScreenshots(beforeFiles, afterFiles)
    .map((story) => renderStory(repo, branch, sha, story))
    .join("\n\n");

  return [
    MARKER,
    "## 📸 Storybook screenshots",
    "",
    `Before / after of the changed stories at commit \`${shortSha}\` — advisory, not a gate. "Before" is \`main\`'s render; a story new in this PR shows After only.`,
    "",
    blocks,
    "",
    "---",
    "_Updated by the Storybook Screenshots job (see #339)._",
  ].join("\n");
}

function readPngs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".png"))
    .sort();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo || !process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_REPOSITORY and GITHUB_TOKEN must be set.");
  }
  if (!args.pr || !args.branch || !args.sha) {
    throw new Error("--pr, --branch and --sha are required.");
  }

  const beforeFiles = readPngs(args.beforeDir);
  const afterFiles = readPngs(args.afterDir);
  if (beforeFiles.length === 0 && afterFiles.length === 0) {
    console.log("No screenshots to post.");
    return;
  }

  const body = buildBody(repo, args.branch, args.sha, beforeFiles, afterFiles);
  const existing = await findMarkerComment({
    repo,
    pr: args.pr,
    token: process.env.GITHUB_TOKEN,
  });

  if (existing) {
    await gh(`/repos/${repo}/issues/comments/${existing.id}`, "PATCH", {
      body,
    });
    console.log(`Updated screenshot comment ${existing.id}.`);
  } else {
    await gh(`/repos/${repo}/issues/${args.pr}/comments`, "POST", { body });
    console.log("Created screenshot comment.");
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
