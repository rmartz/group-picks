---
type: Workflow
title: Storybook CI
description: How this repo consumes the shared rmartz/storybook-ci reusable workflows for Storybook tests and per-PR screenshot galleries, what stayed in-repo, and the PAT the gallery needs.
resource: .github/workflows/storybook-screenshots.yml
tags: [storybook, ci, screenshots, pat]
---

# Storybook CI

Storybook's CI is two thin caller workflows that delegate to
[`rmartz/storybook-ci`](https://github.com/rmartz/storybook-ci), pinned by commit
SHA with a `# vX.Y.Z` comment Dependabot reads to keep the pin current. The
operational reasoning — Chromium provisioning and binary caching with an
apt-retry, change gating, fail-vs-cancel deadline budgeting, per-PR concurrency,
fork exclusion, advisory isolation — lives upstream once, so a fix there reaches
us through a pin bump instead of an edit.

## The two callers

| File                                          | Role             | Required check?                           |
| --------------------------------------------- | ---------------- | ----------------------------------------- |
| `.github/workflows/storybook-tests.yml`       | Gating tests     | Yes — `storybook-tests / Storybook Tests` |
| `.github/workflows/storybook-screenshots.yml` | Advisory gallery | No                                        |

**`storybook-tests.yml`** runs the `storybook` vitest browser project. It needs
no `test-command`: the shared default (`pnpm exec vitest run --project
storybook`) already resolves against `vitest.config.mts`. It carries **no**
`on.paths` — gating is the shared workflow's `detect-changes` job plus its
per-job `if:`, because a required check that never runs because its paths did not
match hangs the PR forever, while a _skipped_ job counts as passing.

**`storybook-screenshots.yml`** builds Storybook, screenshots the stories a PR's
changes touch, and posts them as one update-in-place PR comment whose images are
GitHub user-attachments. It is advisory — never a merge gate — so it may safely
use `on.paths`. The filter is `src/**` (not `*.stories.*`) because the upstream
resolver default is `colocation`: a component edited without touching its story
still resolves to that story.

Its `permissions:` block grants **both** `contents: read` and `pull-requests:
write`. A caller's `permissions:` block is exhaustive — every scope it omits
becomes `none` — and the reusable workflow checks this repo out.

## What stayed in-repo

`Storybook Build` remains a job in `ci-actions.yml`, and the tests caller passes
`run-build: false` so the shared workflow does not duplicate it. That job does
more than build: it renders canary Redux-connected stories from the built bundle
(`scripts/check-storybook-render.mjs`) to guard the Vite 8 / Rolldown reselect
tree-shaking regression (#381). The shared build job has no post-build hook, so
adopting it would silently drop that watchdog. Fold the job into the shared
workflow once #381 closes.

## The screenshot PAT

The GitHub user-attachments upload endpoint rejects the Actions `GITHUB_TOKEN`,
so the screenshots workflow authenticates `gh` with a repository secret named
**`STORYBOOK_SCREENSHOT_PAT`**, forwarded by `secrets: inherit`.

Create it as a **fine-grained** PAT scoped to **this repository only**, with a
single permission — **`Pull requests: Read and write`**. `Contents` is not
needed: `actions/checkout` uses the job's own `GITHUB_TOKEN`. A classic
`repo`-scoped PAT also works but grants full read/write across every repository
the owner can reach, so prefer the fine-grained one. Add it under **Settings →
Secrets and variables → Actions** — an _Actions_ secret, not an Agent secret,
which Actions cannot read.

Until the secret exists, the workflow does not fail: its preflight step posts a
non-blocking advisory PR comment saying the gallery is configured but cannot
post, and skips the capture. The job is skipped entirely on fork PRs, so the PAT
never reaches fork-authored code.

**A green job is not proof the PAT works.** On a PR whose changes resolve to zero
stories, the gate short-circuits everything after it — including the PAT check.
Validate a new PAT with a PR that actually touches a story file or a co-located
component.

## Known gap: no Before/After

The in-repo capture this replaced rendered each changed story twice — the PR
version and the base-branch version — and posted them side by side (#403). The
shared workflow captures **After only**. That regression is tracked upstream in
[rmartz/storybook-ci#22](https://github.com/rmartz/storybook-ci/issues/22); when
it lands, adopting it here is a pin bump.

## Bumping the pin

Dependabot's `github-actions` ecosystem raises a PR that moves both callers' SHAs
and their `# vX.Y.Z` comments. The screenshots workflow runs the upstream capture
code at exactly the SHA pinned here (`job.workflow_sha`) — it installs no
published package — so a pinned ref is fully reproducible and the version lives
only in the pin comment.
