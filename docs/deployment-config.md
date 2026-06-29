---
type: Workflow
title: Deployment config
description: Public (non-secret) env config in deployment/{env}.yml and schema validation.
resource: deployment
tags: [deployment, config, env, vercel]
---

# Deployment config

Public (non-secret) environment configuration lives in `deployment/{env}.yml` and is validated against `deployment/schema.yml`. Only `NEXT_PUBLIC_*` and explicitly allowlisted keys are permitted; keys matching `*SECRET*`, `*_TOKEN*`, or `*PRIVATE_KEY*` are hard-denied. Secrets are managed separately through Vercel, never in these files.

## Editing config

- Set a value: `scripts/update-config.sh --env=<env> KEY=value`
- Load from a Firebase console JSON download: `scripts/update-config.sh --env=<env> --firebase-config=path/to/config.json` (accepts strict JSON or the JS object-literal format the console produces)
- Validate config files against the schema: `pnpm run env:validate`

`scripts/update-config.sh` only writes and validates the local YAML.

## Deploying to Vercel

The previous deploy tooling (`vercel-deploy-scripts`, providing `sync-env` / `generate-local-env`) has been removed. Pushing the YAML values to Vercel and pulling a local `.env.local` will be handled by a dedicated CLI, **`envctl`** (usage TBD) — a local-only env-management tool that is intentionally not wired into CI. Until it lands, manage env values directly with the `vercel` CLI (a devDependency).

## Secret scanning

Secret scanning runs in CI via `.github/workflows/secret-scan.yml`. There is no local pre-commit secret scan; the pre-commit hook validates the deployment config (`pnpm run env:validate`) but does not run gitleaks.

## Related

- `AGENTS.md` → Deployment Config (the authoritative command reference)
- [Architecture overview](architecture.md) — where config feeds the Firebase client/admin setup
