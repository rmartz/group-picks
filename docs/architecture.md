---
type: Architecture
title: Architecture overview
description: The Next.js App Router + Firebase stack and the server data-layer / schema-converter / type-module layering.
resource: src/server/data
tags: [architecture, nextjs, firebase, layering]
---

# Architecture overview

group-picks is a [Next.js](https://nextjs.org/) App Router application backed by [Firebase](https://firebase.google.com/). Server-side data access is layered so that the persistence shape stays isolated behind a small set of converters.

## Layers

| Layer              | Location                       | Responsibility                                                                                  |
| ------------------ | ------------------------------ | ----------------------------------------------------------------------------------------------- |
| Route handlers     | `src/app/api/**/route.ts`      | HTTP entry points; validate input, call the data layer, shape the response.                     |
| Server data layer  | `src/server/data/*.ts`         | All reads/writes against Firebase. One module per domain (picks, groups, invites, …).           |
| Schema converters  | `src/lib/firebase/schema/*.ts` | Translate between the persisted Firebase shape and the app's domain types. The schema boundary. |
| Domain types       | `src/lib/types/*.ts`           | The app-facing TypeScript shapes (`Group`, `GroupPick`, `Option`, `GroupInvite`, `Category`).   |
| Firebase admin/SDK | `src/lib/firebase/`            | `admin.ts` (server, `firebase-admin`) and `client.ts` (browser SDK).                            |

A request flows **route handler → data-layer function → schema converter → Firebase**, and back out the same way. Route handlers never touch raw Firebase field names; the data layer never returns a raw Firebase object.

## The schema boundary

Every persisted shape has a paired converter in `src/lib/firebase/schema/`:

- `{domain}ToFirebase(domainObject)` — domain type → Firebase shape (on write).
- `firebaseTo{Domain}(id, firebaseData, …)` — Firebase shape → domain type (on read).

Domain types use `Date`; the Firebase shapes use epoch-millisecond `number`s. Converters do that translation in one place, so when the persisted shape changes only the converter and its spec change — raw field names never scatter across the codebase. See [the data model](data-model.md) for the full tree and per-domain shapes.

## Related

- [Data model](data-model.md)
- [Picks](picks.md) · [Groups](groups.md) · [Invites](invites.md)
