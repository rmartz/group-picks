---
type: Index
title: group-picks knowledge base
description: OKF-conformant reference knowledge for the group-picks codebase — architecture, data model, and per-domain notes agents retrieve before a task.
tags: [okf, index, reference]
---

# group-picks knowledge base

This directory is an [Open Knowledge Format (OKF)](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) bundle: one markdown file per concept, each carrying YAML frontmatter, linked together as a traversable graph. It holds **curated reference knowledge an agent retrieves before a task** — the detailed background that is too verbose to live in the always-in-context directive files (`AGENTS.md` / `CLAUDE.md`).

Directives are policy (always in context); these pages are pull/retrieval reference. Keep that boundary: behavioral rules belong in `AGENTS.md`, explanatory background belongs here.

## `type` vocabulary

Every page declares one `type` in its frontmatter. The canonical vocabulary for this repo:

| `type`         | Use for                                                               |
| -------------- | --------------------------------------------------------------------- |
| `Index`        | This file — the directory listing (reserved OKF convention).          |
| `Architecture` | Cross-cutting structure: layering, the stack, how pieces fit.         |
| `DataModel`    | Persistence shape: database paths, document schemas, converters.      |
| `Domain`       | A single product domain: its lifecycle, rules, and data-layer module. |
| `Workflow`     | A repeatable operational process: deploy, config, release.            |

## Pages

### Architecture

- [Architecture overview](architecture.md) — the Next.js + Firebase stack and the server data-layer / schema-converter / type-module layering.

### Data model

- [Data model](data-model.md) — the Firebase Realtime Database tree and the `{domain}ToFirebase()` / `firebaseTo{Domain}()` schema boundary.

### Domains

- [Picks](picks.md) — ranked-choice pick lifecycle: open, vote, close, results.
- [Groups](groups.md) — groups, membership, and admin roles.
- [Invites](invites.md) — token-based group invites with TTL expiry.

### Workflows

- [Deployment config](deployment-config.md) — public env config in `deployment/{env}.yml` and the `sync-env` deploy flow.
- [Staging OAuth domain](staging-oauth-domain.md) — pin a stable staging alias and allowlist it in Firebase Authorized domains so Google/Apple OAuth works on previews.

## Authoring

When adding a page, give it frontmatter (`type` is required; `title`, `description`, `resource`, `tags` are recommended) and add it to the relevant section above. See the docs-authoring directive in `AGENTS.md`.
