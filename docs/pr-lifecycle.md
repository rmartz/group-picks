---
type: Workflow
title: pr-lifecycle
description: The shared @rmartz/pr-lifecycle reconciler, run by the hosted rmartz-pr-lifecycle GitHub App (no workflow in this repo), which keeps each PR's lifecycle labels in step with its current facts, and arms auto-merge when a PR reaches approved.
tags: [ci, github-app, pr-lifecycle, labels]
---

# pr-lifecycle

This repo has **no pr-lifecycle workflow**. The reconciler runs as the hosted
`rmartz-pr-lifecycle` GitHub App,
[`rmartz/pr-lifecycle-app`](https://github.com/rmartz/pr-lifecycle-app). The App
receives this repo's webhooks: opens, pushes, labels, reviews, review requests,
and CI completing. For each one it recomputes the PR's lifecycle state from its
current facts and converges its labels: `approved`, `changes requested`,
`blocked`, `escalation needed`, `fix required`, `ci failing`, and
`review requested`. A `/review` verdict on the current head drives the state,
and a push invalidates it, so a label never describes a head that hasn't earned
it. The App's policy for this repo lives in its
[`src/repos.ts`](https://github.com/rmartz/pr-lifecycle-app/blob/main/src/repos.ts),
so changing it is a PR there, not here.

**Arming.** When a PR reaches `approved`, including an eligible Dependabot PR,
the App arms GitHub-native auto-merge, which lands once the default-branch
ruleset's required checks pass, the `pr-policy` UAT gate included. With
auto-update on it also brings an approved PR that merge-safety labels
`update required` current with update-branch, but never a Dependabot PR: a person
or Dependabot itself rebases those. The App is the real actor for arming,
merging, and updating, so the merge and the new head trigger workflows as usual.

**UAT.** With UAT on, it keeps exactly one of `no UAT needed`, `UAT pending`,
`UAT ready`, or `UAT passed` on each PR, and posts the `pr-lifecycle/sign-off`
commit status saying which human sign-off the head needs. The pr-policy caller
gates on that status, trusting it from `rmartz-pr-lifecycle[bot]` (the
`sign-off-status-creators` default).

**Label writes start workflows.** The App writes labels with its installation
token, so each lifecycle label it adds fires this repo's `labeled` workflows:
pr-policy, merge-safety, and the preview deploy.

**Approval carry-over.** A review on an earlier commit still counts after a
clean rebase or base merge. The App verifies that with git in a Vercel Sandbox
and, if it can't, counts no earlier approval; see the App's
[approval carry-over](https://github.com/rmartz/pr-lifecycle-app/blob/main/docs/server.md#approval-carry-over).

The reconciler's behaviour is documented in
[pr-lifecycle's docs](https://github.com/rmartz/pr-lifecycle/blob/main/docs/overview.md).
