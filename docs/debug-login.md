---
type: Workflow
title: Debug login switcher
description: How to activate the preview-only debug user switcher — the NEXT_PUBLIC_DEBUG_AUTH flag, seeding debug users, and verifying the panel.
resource: src/lib/debug/profiles.ts
tags: [debug, auth, preview, seed, testing]
---

# Debug login switcher

The **debug login switcher** is a preview/staging-only panel that lets a tester sign in as one of a few seeded users without going through OAuth. It renders as a fixed panel in the bottom-right corner of every page and mints a Firebase custom token for the chosen profile, then establishes the normal session cookie — the same path real sign-in uses, just without the provider UI.

Component: [`DebugUserSwitcher`](../src/components/debug/DebugUserSwitcher.tsx) (mounted in [`src/app/layout.tsx`](../src/app/layout.tsx)). Gate: [`isDebugAuthEnabled`](../src/lib/debug/profiles.ts). Server endpoint: [`POST /api/auth/debug-login`](../src/app/api/auth/debug-login/route.ts). Seed script: [`scripts/seed-debug-users.mjs`](../scripts/seed-debug-users.mjs).

## When it is active

`isDebugAuthEnabled()` returns `true` only when **both** conditions hold:

1. `NEXT_PUBLIC_DEBUG_AUTH === "true"` — an explicit opt-in flag, and
2. `VERCEL_ENV !== "production"` — a hard backstop so the bypass can never activate in production, even if the flag is mistakenly set there.

`NEXT_PUBLIC_DEBUG_AUTH` is a `NEXT_PUBLIC_*` variable, so it is bundled into the client JavaScript at build time. `VERCEL_ENV` is undefined in the browser, so on the client the flag alone governs whether the panel renders; the server endpoint enforces the full gate and returns `404` anywhere it is not active. The route is therefore inert even if it ships in a production bundle.

Because the value is baked in at build time, changing `NEXT_PUBLIC_DEBUG_AUTH` requires a **new deployment** to take effect — toggling it on an existing deployment does nothing until the next build.

## Activating it on a Vercel preview

1. **Set the flag on the deployment.** Add `NEXT_PUBLIC_DEBUG_AUTH=true` to the Preview (and/or a specific non-production) environment for the Vercel project, then trigger a redeploy so the value is compiled into the client bundle. Do **not** set it on Production — the `VERCEL_ENV` backstop makes the server endpoint return `404` in production so sign-in will fail, but the panel itself would still render client-side (since `VERCEL_ENV` is undefined in the browser), showing a debug UI to real users.

2. **Seed the debug users and data.** The switcher mints tokens for fixed uids (`debug-alice`, `debug-bob`, `debug-casey`); those Firebase Auth users and a small slice of group/category/pick data must exist for the app's membership checks to pass once a debug user signs in. Run the seed against the preview/staging Firebase project:

   ```bash
   pnpm run seed:debug
   ```

   The script reads Firebase Admin credentials (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_DATABASE_URL`) from `.env.local` — run `pnpm run env:pull` first to populate them for the target project. It is idempotent (re-running updates existing users and overwrites the seeded nodes in place) and refuses to run when `VERCEL_ENV=production`.

3. **Verify the panel appears.** Open the preview URL. A **Debug login** panel should appear pinned to the bottom-right corner listing the seeded profiles:

   - **Alice — group owner** (owns a seeded group with a category and picks)
   - **Bob — group member** (a member of Alice's group)
   - **Casey — newcomer** (no groups yet; exercises the empty state)

   Click a profile to sign in as that user; the app reloads at `/` with that session. If the panel is absent, the flag is not set (or the deployment predates setting it). If signing in shows "Could not switch user. Is the debug seed loaded?", the seed step has not been run against that project.

## Local development

The same flag works locally: set `NEXT_PUBLIC_DEBUG_AUTH=true` in `.env.local`, run `pnpm run seed:debug` against your dev Firebase project, and restart `pnpm dev`. `VERCEL_ENV` is unset locally, so only the flag matters.

## Adding or changing profiles

The profile list lives in [`src/lib/debug/profiles.ts`](../src/lib/debug/profiles.ts) (`DEBUG_PROFILES`) and is duplicated in [`scripts/seed-debug-users.mjs`](../scripts/seed-debug-users.mjs) — the `.mjs` seed script cannot import the `.ts` module, so the two lists must be kept in sync by hand. A profile's `id` doubles as its Firebase Auth uid. After editing either list, re-run `pnpm run seed:debug` so the Auth users match.

## Related

- [Architecture overview](architecture.md) — where the Firebase client/admin setup this feature builds on lives.
- [Deployment config](deployment-config.md) — how public env config and `NEXT_PUBLIC_*` variables are managed.
