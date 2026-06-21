---
type: Workflow
title: Deployment config
description: Public (non-secret) env config in deployment/{env}.yml, schema validation, and the sync-env deploy flow.
resource: deployment
tags: [deployment, config, env, vercel, sync-env]
---

# Deployment config

Public (non-secret) environment configuration lives in `deployment/{env}.yml` and is validated against `deployment/schema.yml`. Only `NEXT_PUBLIC_*` and explicitly allowlisted keys are permitted; keys matching `*SECRET*`, `*_TOKEN*`, or `*PRIVATE_KEY*` are hard-denied. Secrets are managed separately through Vercel and the `sync-env` tooling, never in these files.

## Editing config

- Set a value: `scripts/update-config.sh --env=<env> KEY=value`
- Load from a Firebase console JSON download: `scripts/update-config.sh --env=<env> --firebase-config=path/to/config.json` (accepts strict JSON or the JS object-literal format the console produces)
- Edit and deploy in one step: add `--sync` to either command
- Validate config files against the schema: `pnpm run env:validate`

## Deploying

All deployment tooling comes from `vercel-deploy-scripts` (a devDependency) — no global `vercel` install is required.

- Deploy the current YAML without modifying it: `pnpm exec sync-env --env=<env>`
- Deploy one env's config to a different Vercel target: `pnpm exec sync-env --env=production`, then set `VERCEL_ENV=preview` (used while staging is disabled)
- Rotate all secrets (Firebase + Sentry + Vercel): `pnpm exec sync-env --rotate-keys --env=<env>`
- Pull `.env.local` from Vercel: `pnpm run env:pull`

## Secret scanning

A secrets check runs on every commit via `.husky/pre-commit` (config validation + a gitleaks scan) and is enforced in CI by `.github/workflows/secret-scan.yml`. Run it manually with `pnpm run secrets-check`.

## Related

- `AGENTS.md` → Deployment Config (the authoritative command reference)
- [Architecture overview](architecture.md) — where config feeds the Firebase client/admin setup
