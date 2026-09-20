---
type: Workflow
title: Dependabot grouping
description: How npm Dependabot updates are grouped, and the audit that keeps the grouping evidence-based.
resource: scripts/dependabot-audit.mjs
tags: [dependabot, dependencies, ci, audit]
---

# Dependabot grouping

Dependabot batches npm updates into groups so a week's low-risk bumps land in one
PR, while riskier bumps are isolated for focused review. The grouping is defined
in [`.github/dependabot.yml`](../.github/dependabot.yml). This page explains the
strategy, and the audit that keeps it honest.

## The groups

Two axes decide how a bump is grouped:

- **Catch-alls** — `dev-dependencies` and `production-dependencies` collect every
  **minor + patch** bump of their dependency type into one weekly PR each. Keeping
  dev and prod separate is deliberate: a broken prod bump should never block dev
  tooling updates, and vice versa.
- **Majors are individual by default.** A major bump matches no catch-all, so it
  is raised as its own PR — majors are the most likely to need a code change and
  warrant isolated review.
- **Version-locked families** override the above for packages whose versions must
  move together, so a major to one is broken without the rest:
  - `react` keeps **all** update-types because it spans the prod/dev split
    (`react` / `react-dom` are prod, `@types/react*` are dev); its minor/patch
    would otherwise scatter across the two catch-alls instead of staying atomic.
  - `vite`, `eslint`, `storybook`, and `tailwind` restrict to **major** only —
    their minor/patch already move in lockstep inside the catch-alls, so the major
    is the only bump that would fragment the family into standalone PRs.

## Why it must be evidence-based

Every group beyond the catch-alls is a bet that its members are more likely to
break than an ungrouped bump. That bet has a cost — more PRs to review — so a
group that never prevents a broken merge is pure overhead. The audit turns the
bet into a measurement.

An audit of the full Dependabot history (see issue #479) found only a handful of
bumps ever needed a fix PR to unblock them, and the pattern did **not** match the
a-priori risk model:

- Breakage correlated with **major** bumps (Vite 8 → built-Storybook, jose v6 →
  prod auth) and with unpredictable per-package release behaviour
  (`@sentry/nextjs` deprecation, `happy-dom` feature addition) — not with any
  "this package is risky" heuristic.
- The `prettier` and `typescript` risk-isolation groups had **never** caught a
  real breakage. Each had fired only once (a superseded prettier PR; a still-open
  typescript major), so they were **untested**, not proven safe.
- Half the interventions came from the "low-risk" catch-alls the model does not
  isolate.

## The experiment (#479)

Because `prettier` and `typescript` were the only pure-risk, non-lockstep groups
and neither had earned its keep, they were **removed** as a deliberate A/B test.
Their minor bumps now rejoin the `dev-dependencies` batch and their majors surface
as individual PRs, like any other package. The audit then measures whether they
actually fail at a higher rate than the baseline.

Everything the constraints protect was **kept**: dev/prod separation, `react`
(spans the prod/dev split), the lockstep families (`vite`, `eslint`, `storybook`,
`tailwind`), and the majors-as-individual-PRs policy the two major incidents
justify.

**Decision rule:** restore a group here only once the audit shows its members
actually accrue interventions at a higher rate than the catch-all baseline.

## The audit

[`scripts/dependabot-audit.mjs`](../scripts/dependabot-audit.mjs) reconstructs,
from the GitHub API, how every Dependabot PR turned out — `clean`, `needed-fix`,
`stuck` (open and red), or routine supersede-`churn` — attributes each to its
group, and prints a per-group intervention-rate table.

Run it locally:

```bash
node scripts/dependabot-audit.mjs --repo rmartz/group-picks
```

The [`Dependabot audit`](../.github/workflows/dependabot-audit.yml) workflow runs
it on the 1st of each month (and on demand via `workflow_dispatch`), publishes the
report to the job summary, and upserts a single `Dependabot grouping audit`
tracking issue so the trend is visible over time.

### Attribution convention

The audit attributes a fix to a Dependabot PR only when the fix PR **names** it —
by the `Dependabot PR #N` token or a same-repo `/pull/N` link (the
`fix: resolve CI failure for Dependabot PR N` convention supplies both). An
incident-driven version pin that does not cite the Dependabot PR number (e.g.
`fix!: pin Vite to 7`, `fix!: pin jose to 5.x`) is **not** auto-attributed, so the
tool undercounts those. When you unblock a Dependabot bump, name the Dependabot PR
in the fix PR so the audit captures it.
