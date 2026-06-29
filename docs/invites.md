---
type: Domain
title: Invites
description: Token-based group invites with TTL expiry, rotation, and the join flow.
resource: src/server/data/invites.ts
tags: [invites, tokens, expiry, membership]
---

# Invites

An **invite** is a shareable token that lets someone join a group. Tokens live at `invites/{token}`; the group's currently-active token is mirrored at `groups/{groupId}/public/inviteToken`. Data layer: [`src/server/data/invites.ts`](../src/server/data/invites.ts).

## Token shape

A token is a `randomUUID()` with dashes stripped. `FirebaseGroupInvite` carries `groupId`, `createdAt`, `expiresAt` (`number | null`), and `active`. `INVITE_TTL` is **7 days**; `createGroupInvite` sets `expiresAt = createdAt + INVITE_TTL`.

`expiresAt: null` means **never expires** — this is the one place in the data model that intentionally uses `null` (Realtime Database has no `undefined`, and the converter maps `null ↔ undefined`).

## Operations

- `createGroupInvite(groupId, oldToken?)` — mints a fresh token, writes `invites/{token}` and `groups/{groupId}/public/inviteToken` in one multi-path update, and (if `oldToken` is given) flips the previous token's `active` to `false`. Rotation is atomic: the group always points at exactly one active token.
- `getGroupInviteByToken(token)` — reads and **validates** the raw node (`isFirebaseGroupInvite`) before converting; malformed or missing data returns `undefined` rather than throwing.
- `updateGroupInviteExpiry(token, expiresAt | null)` — sets a new expiry, or `null` to make the token permanent.
- `addGroupMember(groupId, uid)` — writes `groups/{groupId}/members/{uid}: true`, completing the join. (Pair with the user-index write described in [Groups](groups.md).)

## Validation on read

`getGroupInviteByToken` runs `isFirebaseGroupInvite` as a runtime type guard: `groupId` and `createdAt` must be present and correctly typed, `expiresAt` must be a number or null, and `active` must be a boolean. This guards against tampered or stale token nodes — an invalid node is treated as "no such invite."

## Data shape

`FirebaseGroupInvite` — see [the data model](data-model.md). Converter: [`invite.ts`](../src/lib/firebase/schema/invite.ts).

## Related

- [Data model](data-model.md) · [Architecture overview](architecture.md)
- [Groups](groups.md) — what an invite grants membership to.
