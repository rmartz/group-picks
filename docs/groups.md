---
type: Domain
title: Groups
description: Groups, membership, admin roles, and the user→group membership index.
resource: src/server/data/groups.ts
tags: [groups, membership, admins]
---

# Groups

A **group** is the top-level container: members, admins, and (through categories) picks. Public metadata lives at `groups/{groupId}/public`; membership at `groups/{groupId}/members/{uid}: true`. Data layer: [`src/server/data/groups.ts`](../src/server/data/groups.ts).

## Reads

- `getGroupById(id)` — reads `public` and `members` in parallel and returns a `Group` (with `memberIds`), or `undefined` if the group does not exist.
- `getGroupsByUserId(uid)` — reads the user's membership index at `users/{uid}/groups`, then fetches each group. The index is what makes "my groups" a single lookup instead of a scan.
- `getMemberDisplayNames(uids)` — resolves member UIDs to display names via Firebase Auth (`getUsers`), falling back to email then UID.

## Membership

Membership is stored two ways that must stay in sync:

- `groups/{groupId}/members/{uid}: true` — the group's member set.
- `users/{uid}/groups/{groupId}` — the per-user index (powers `getGroupsByUserId`).

`removeMember(groupId, uid)` removes the caller from a group using a **transaction** on the members map:

- If the caller is the **last** member, the transaction aborts (no write) and it returns `{ lastMember: true }` — the caller decides what to do with a soon-to-be-empty group.
- Otherwise it writes back the members map without the caller, then best-effort clears the user-index entry, and returns `{ lastMember: false }`.

The transaction is load-bearing: without it, two concurrent removals in a two-member group could both pass the last-member guard and empty the group.

Members are **added** through the invite flow — see [Invites](invites.md) (`addGroupMember`).

## Admins & restrictions

`FirebaseGroupPublic` carries `adminIds?` (`{uid: true}`) and `picksRestricted?`. On read (`firebaseToGroup`):

- `adminIds` defaults to `[creatorId]` when absent — the creator is always an admin.
- `picksRestricted` defaults to `false`. When true, pick creation is limited to admins.

## Data shape

`FirebaseGroupPublic` — see [the data model](data-model.md). Converter: [`group.ts`](../src/lib/firebase/schema/group.ts).

## Related

- [Data model](data-model.md) · [Architecture overview](architecture.md)
- [Invites](invites.md) — how members join. [Picks](picks.md) — what groups decide on.
