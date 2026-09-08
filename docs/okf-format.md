---
type: Reference
title: OKF format
description: How this repo's docs follow Google's Open Knowledge Format (OKF), with the published spec as the authoritative reference for any format questions.
tags: [okf, docs, format, reference]
---

# OKF format

This repo's `docs/` tree is authored in the **Open Knowledge Format (OKF)** — an open convention from Google for writing knowledge that both people and agents can retrieve. An OKF page is a plain markdown file that opens with a YAML frontmatter block of metadata and links to related pages with ordinary markdown links, so a directory of pages forms a traversable knowledge graph.

## Authoritative reference

The canonical definition of OKF is Google's specification. For any question this page does not answer — field semantics, edge cases, or additions to the format — **defer to the spec, not to this page**:

> **<https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md>**

This page documents only how OKF is applied _in this repo_. Where our local conventions are narrower than the spec (for example, the closed `type` vocabulary below), the local rule is what CI enforces; where this page is silent, the spec governs.

## How this repo applies OKF

Every `.md` file under `docs/` is an OKF page and must satisfy two rules, both enforced in CI by `scripts/validate-docs.mjs` (run locally with `pnpm run docs:validate`):

### 1. Frontmatter

Each page opens with a `---`-fenced YAML block:

```yaml
---
type: Domain # one of the vocabulary below
title: Invites
description: One-line summary of what the page documents.
resource: src/server/data/invites.ts # optional; repo-relative path it documents
tags: [invites, tokens] # optional
---
```

- **`type`** (required) — one of the repo's `type` vocabulary.
- **`title`** (required) — a short human-readable name.
- **`description`** (required) — a one-line summary.
- **`resource`** (optional) — a repo-relative path to what the page documents; if present, it must exist.
- **`tags`** (optional) — free-form keywords.

The `type` vocabulary is a closed set — a local narrowing of OKF's open `type` field, so pages stay consistently categorized. The current values and their meanings are listed in the [documentation index](index.md#type-vocabulary). Introducing a genuinely new kind of page means extending both that table and `ALLOWED_TYPES` in `scripts/validate-docs.mjs`.

### 2. Index navigability

Every directory that contains docs has an `index.md`. Every non-index page is linked from the `index.md` in its own directory, and every subdirectory's `index.md` is linked from its parent directory's `index.md`. A reader can therefore start at the root [documentation index](index.md) and reach every page by following links — `docs/index.md` → `sub/index.md` → `sub/page.md`. This realizes OKF's "traversable graph" property as a concrete, checkable rule.

## Why OKF here

Directives (`AGENTS.md` / `CLAUDE.md`) are policy that is always in an agent's context; OKF pages are pull/retrieval reference — the detailed background that is too verbose to keep always-loaded. Structuring that reference as OKF gives each page self-describing metadata and a predictable shape, so an agent can find and load exactly the page a task needs. See the [documentation index](index.md) for the full page listing and authoring notes.
