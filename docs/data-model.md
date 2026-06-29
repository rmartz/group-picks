---
type: DataModel
title: Data model
description: The Firebase Realtime Database tree and the {domain}ToFirebase() / firebaseTo{Domain}() schema boundary.
resource: src/lib/firebase/schema
tags: [data-model, firebase, realtime-database, schema]
---

# Data model

Persistence is **Firebase Realtime Database** (accessed via `firebase-admin/database` and `db.ref(...)` in the [server data layer](architecture.md)). Data is a single JSON tree; the paths below are the live shape the code reads and writes.

All reads/writes cross the schema boundary in `src/lib/firebase/schema/*.ts`: domain types (using `Date`) on one side, Firebase shapes (epoch-millisecond `number`s) on the other.

## Tree

```
groups/
  {groupId}/
    public/                FirebaseGroupPublic
    members/
      {uid}: true
categories/
  {categoryId}/
    public/                FirebaseCategoryPublic   (.indexOn: ["public/groupId"])
    picks/
      {pickId}/            FirebasePickPublic
picks/
  {pickId}/
    options/
      {optionId}/          FirebaseOption
invites/
  {token}/                 FirebaseGroupInvite
users/
  {uid}/
    groups/
      {groupId}: <truthy>  membership index
```

Note the two read paths for options. A pick under `categories/{categoryId}/picks/{pickId}` may carry an embedded `options` map (`FirebasePickPublic.options`), while the options data layer (`src/server/data/options.ts`) reads and writes the separate `picks/{pickId}/options` subtree. Treat both as authoritative for what each module actually touches.

## Persisted shapes

Each shape has a converter pair in `src/lib/firebase/schema/`. Fields marked optional (`?`) may be absent in the database.

### FirebaseGroupPublic — `groups/{groupId}/public`

`name`, `createdAt` (ms), `creatorId`, `inviteToken`, `adminIds?` (`{uid: true}`), `picksRestricted?`. Converter: [`group.ts`](../src/lib/firebase/schema/group.ts). On read, `adminIds` defaults to `[creatorId]` and `picksRestricted` to `false`. See [Groups](groups.md).

### FirebaseCategoryPublic — `categories/{categoryId}/public`

`name`, `description?`, `groupId`, `createdAt` (ms), `creatorId`. Indexed on `public/groupId` so categories can be queried by group. Converter: [`category.ts`](../src/lib/firebase/schema/category.ts).

### FirebasePickPublic — `categories/{categoryId}/picks/{pickId}`

`title`, `description?`, `topCount?` (defaults to `1` on read), `dueDate?` (ms), `categoryId`, `createdAt` (ms), `creatorId`, `closedAt?` (ms), `closedManually?`, `options?` (`{optionId: {ownerIds, title}}`). Converter: [`pick.ts`](../src/lib/firebase/schema/pick.ts). `closedAt` is validated on read (finite, positive, not in the future). See [Picks](picks.md).

### FirebaseOption — `picks/{pickId}/options/{optionId}`

`title`, `ownerIds?` (`{uid: true}`). Converter: [`option.ts`](../src/lib/firebase/schema/option.ts). An option with no owners is deleted rather than persisted empty.

### FirebaseGroupInvite — `invites/{token}`

`groupId`, `createdAt` (ms), `expiresAt` (`number | null` — `null` means never expires), `active`. Converter: [`invite.ts`](../src/lib/firebase/schema/invite.ts). This is the one shape that intentionally uses `null` (Realtime Database compatibility for "no expiry"). See [Invites](invites.md).

## Conventions

- **Pre-launch, database state is ephemeral** — breaking schema changes do not require a migration; the database can be wiped and re-seeded. Post-launch, subtractive changes require a migration. (See `AGENTS.md` → Firebase & Data Model.)
- **Additive changes are safe**; removing a field, changing its type, or making an optional field required is breaking.
- **Change the converter, not the call sites** — when a persisted shape changes, update the converter in `src/lib/firebase/schema/` and its `.spec.ts`.

## Related

- [Architecture overview](architecture.md)
- [Picks](picks.md) · [Groups](groups.md) · [Invites](invites.md)
