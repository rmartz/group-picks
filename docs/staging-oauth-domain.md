---
type: Workflow
title: Staging OAuth domain
description: Pin one stable staging alias and allowlist it in Firebase Authorized domains so Google/Apple OAuth works on preview deployments.
resource: deployment
tags: [auth, oauth, firebase, vercel, staging, authorized-domains, preview]
---

# Staging OAuth domain

Google/Apple OAuth (`signInWithPopup`) only works when the request origin is in
Firebase's **Authorized domains** allowlist. Vercel's per-commit preview URLs are
dynamic and cannot be wildcarded — `*.vercel.app` is unsupported by Firebase and
unsafe anyway (it would authorize every other Vercel project's previews). The fix
is to pin **one stable alias** to the staging deployment and allowlist that single
hostname. Ephemeral per-commit previews still can't do OAuth; that case is covered
by email/password sign-in and the preview-only debug user switcher ([#319](https://github.com/rmartz/group-picks/issues/319)).

> **Note:** these are console/account actions in Vercel and Firebase. There is no
> supported API or infrastructure-as-code path for Firebase Authorized domains —
> the Admin SDK does not expose them — so this page is the reproducible record of
> what was configured by hand.

## Mapping

The authoritative record of which alias maps to which branch and which hostname is
allowlisted. Fill these in once the console steps below are complete.

<!-- TODO(#320): fill in the real values after configuring Vercel + Firebase. -->

| Field                       | Value                       |
| --------------------------- | --------------------------- |
| Firebase project (staging)  | `group-picks-staging`       |
| Stable staging alias (host) | `_________________________` |
| Vercel project              | `_________________________` |
| Git branch the alias tracks | `_________________________` |
| Allowlisted in Firebase on  | `____-__-__` (date)         |

## Runbook

### 1. Pin a stable alias in Vercel

Choose one stable hostname for the staging branch. Either is fine:

- **Vercel branch domain** — a deterministic alias for a branch, e.g.
  `group-picks-git-staging-<team>.vercel.app`. Vercel creates this automatically
  for a branch; confirm/lock it under **Project → Settings → Domains**.
- **Custom subdomain** (preferred for stability) — e.g. `staging.<your-domain>`.
  Add it under **Project → Settings → Domains** and assign it to the staging
  branch's deployment.

Record the chosen hostname in the mapping table above.

### 2. Allowlist the hostname in Firebase

In the **staging** Firebase project (`group-picks-staging`):

1. Console → **Authentication** → **Settings** → **Authorized domains**.
2. **Add domain** → enter the single hostname from step 1 (host only, no scheme
   or path).
3. Save. Do **not** add `*.vercel.app` or individual ephemeral preview URLs —
   wildcards are unsupported and ephemeral URLs are unmanageable.

> Confirm you are editing the **staging** project, not production. The project id
> is visible in `deployment/staging.yml` (`NEXT_PUBLIC_FIREBASE_PROJECT_ID`).

### 3. Verify

1. Open the app via the stable staging alias (not an ephemeral preview URL).
2. Sign in with **Google** and with **Apple**.
3. Confirm the popup completes and a session is established (no
   `auth/unauthorized-domain` error in the console).

### 4. Record the mapping

Update the mapping table above with the real alias, branch, project, and the date
the hostname was allowlisted, then land this doc so the configuration is reviewable
and reproducible.

## Related

- [#319](https://github.com/rmartz/group-picks/issues/319) — preview-only debug user switcher (custom-token sign-in; no authorized domain needed)
- [Deployment config](deployment-config.md) — where `NEXT_PUBLIC_FIREBASE_*` values live and how they sync to Vercel
- `src/services/auth.ts` — `signInWithGoogle` / `signInWithApple` (the popup flows gated by the allowlist)
