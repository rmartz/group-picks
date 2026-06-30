#!/usr/bin/env node
import { fileURLToPath } from "node:url";

// Vercel "Ignored Build Step" — gates preview deploys to conserve the daily
// deploy quota. Wired up via the `ignoreCommand` field in vercel.json.
//
// Vercel runs this for every deploy after cloning the repo (before install) and
// reads its exit code: exit 1 = proceed with the build, exit 0 = cancel it.
//
// Policy: production builds always proceed. Preview builds proceed only when the
// associated pull request's title is a `feat:` or `fix:` Conventional Commit —
// the change types that warrant a UAT preview. Everything else (docs, chore,
// refactor, test, style, ci, build, perf, revert) is skipped, along with branch
// pushes that have no open PR yet and draft `[WIP]` titles, which do not need a
// preview to review.
//
// The PR title lives on GitHub, not in the git checkout, so it is fetched from
// the public GitHub REST API. group-picks is a public repo, so the call needs
// no token — this is why the title-based gate requires no API key (unlike the
// label-based follow-up tracked separately). If the repo is ever made private,
// this fetch will 404 and the build will fail open (proceed) per the error
// handling below; a token would then be required.

const BUILD = 1; // exit code → Vercel proceeds with the build
const SKIP = 0; // exit code → Vercel cancels the build

// Matches feat/fix Conventional Commit titles, with an optional scope and an
// optional breaking-change `!`: feat:, fix:, feat(api):, fix(ui)!:, etc.
const DEPLOYABLE_TITLE = /^(feat|fix)(\([^)]*\))?!?:/i;

export function isDeployableTitle(title) {
  return DEPLOYABLE_TITLE.test((title ?? "").trim());
}

async function fetchPullRequestTitle(owner, repo, prNumber) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
    { headers: { Accept: "application/vnd.github+json" } },
  );
  if (!response.ok) {
    throw new Error(`GitHub API responded ${response.status}`);
  }
  const { title } = await response.json();
  return title;
}

async function main() {
  const env = process.env.VERCEL_ENV;
  if (env === "production") {
    console.log("✅ Production deploy — building.");
    process.exit(BUILD);
  }

  const prNumber = process.env.VERCEL_GIT_PULL_REQUEST_ID;
  if (!prNumber || prNumber === "0") {
    console.log("⏭️  No associated pull request — skipping preview deploy.");
    process.exit(SKIP);
  }

  const owner = process.env.VERCEL_GIT_REPO_OWNER;
  const repo = process.env.VERCEL_GIT_REPO_SLUG;

  try {
    const title = await fetchPullRequestTitle(owner, repo, prNumber);
    if (isDeployableTitle(title)) {
      console.log(`✅ PR #${prNumber} "${title}" is feat/fix — building.`);
      process.exit(BUILD);
    }
    console.log(
      `⏭️  PR #${prNumber} "${title}" is not feat/fix — skipping preview deploy.`,
    );
    process.exit(SKIP);
  } catch (error) {
    // Fail open: a transient API failure should not silently drop a preview a
    // reviewer is waiting on. Quota cost of an occasional over-build is the
    // lesser evil versus a missing UAT preview.
    console.warn(
      `⚠️  Could not determine PR title (${error.message}) — building to be safe.`,
    );
    process.exit(BUILD);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
