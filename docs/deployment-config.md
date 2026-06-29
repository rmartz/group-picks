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

The `deployment/{env}.yml` files are edited by hand. Validate against the schema after editing:

- Validate config files against the schema: `pnpm run env:validate`

Validation also runs automatically in the pre-commit hook and in CI (`.github/workflows/validate-config.yml`).

## Deploying to Vercel

The previous deploy tooling (`vercel-deploy-scripts`, providing `sync-env` / `generate-local-env`) and the local config editor (`scripts/update-config.sh`) have been removed. Pushing the YAML values to Vercel and pulling a local `.env.local` will be handled by a dedicated CLI, **`envctl`** (usage TBD) — a local-only env-management tool that is intentionally not wired into CI. Until it lands, manage env values directly with the `vercel` CLI (a devDependency).

## Secret scanning

There is no secret scanning at present. The VDS-based CI secret scan (and its `.gitleaks.toml` config) and the local pre-commit gitleaks scan have both been removed; secret scanning will return under the new env-management design.

## Related

- `AGENTS.md` → Deployment Config (the authoritative command reference)
- [Architecture overview](architecture.md) — where config feeds the Firebase client/admin setup
