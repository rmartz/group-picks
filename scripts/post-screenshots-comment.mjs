#!/usr/bin/env node

// Upsert a single sticky PR comment with inline Storybook screenshots (#339).
// Images are referenced from the per-PR `gh-screenshots-pr-<N>` branch via
// raw.githubusercontent.com (the repo is public). A `?v=<sha>` cache-buster
// makes GitHub's image proxy refetch on each new commit. The comment is found
// and updated by a hidden marker so each run replaces the previous one.
//
// Usage:
//   node scripts/post-screenshots-comment.mjs \
//     --pr=<number> --branch=<gh-screenshots-pr-N> --sha=<head-sha> --dir=screenshots
//
// Requires env: GITHUB_REPOSITORY (owner/repo) and GITHUB_TOKEN.

import { readdirSync } from "node:fs";

const MARKER = "<!-- storybook-screenshots -->";

function parseArgs(argv) {
  const args = { dir: "screenshots" };
  for (const arg of argv) {
    if (arg.startsWith("--pr=")) args.pr = arg.slice(5);
    else if (arg.startsWith("--branch=")) args.branch = arg.slice(9);
    else if (arg.startsWith("--sha=")) args.sha = arg.slice(6);
    else if (arg.startsWith("--dir=")) args.dir = arg.slice(6);
  }
  return args;
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

function buildBody(repo, branch, sha, files) {
  const shortSha = sha.slice(0, 7);
  const images = files
    .map((file) => {
      const url = `https://raw.githubusercontent.com/${repo}/${branch}/${file}?v=${sha}`;
      const name = file.replace(/\.png$/, "");
      return `<details open>\n<summary><code>${name}</code></summary>\n\n![${name}](${url})\n\n</details>`;
    })
    .join("\n\n");

  return [
    MARKER,
    "## 📸 Storybook screenshots",
    "",
    `Visual acceptance aid for the changed stories at commit \`${shortSha}\` — advisory, not a gate.`,
    "",
    images,
    "",
    "---",
    "_Updated by the Storybook Screenshots job (see #339)._",
  ].join("\n");
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

  const files = readdirSync(args.dir)
    .filter((f) => f.endsWith(".png"))
    .sort();
  if (files.length === 0) {
    console.log("No screenshots to post.");
    return;
  }

  const body = buildBody(repo, args.branch, args.sha, files);
  const comments = await gh(
    `/repos/${repo}/issues/${args.pr}/comments?per_page=100`,
  );
  const existing = comments.find((c) => c.body?.includes(MARKER));

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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
