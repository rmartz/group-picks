---
type: Domain
title: Picks
description: Ranked-choice pick lifecycle — open, vote, close, results — and the options attached to a pick.
resource: src/server/data/picks.ts
tags: [picks, options, ranked-choice, lifecycle]
---

# Picks

A **pick** is a ranked-choice decision within a category: a title, a set of options members can own/join, and a `topCount` of how many winners to surface. Picks live at `categories/{categoryId}/picks/{pickId}`. Data layer: [`src/server/data/picks.ts`](../src/server/data/picks.ts); options at [`src/server/data/options.ts`](../src/server/data/options.ts).

## Lifecycle

1. **Create** — `createPick({ title, categoryId, creatorId, topCount, description?, dueDate? })` pushes a new pick and returns `{ id, createdAt }`. It starts open (`closedAt` undefined).
2. **Open / vote** — members add and join options (see below). Writes are gated by `assertPickIsOpenForWrite`.
3. **Close** — a pick closes either automatically (its `dueDate` passes) or manually (`closePick`, which sets `closedManually: true`).
4. **Reopen** — `reopenPick` clears `closedAt` and `closedManually`.

## Open-for-write gate

`assertPickIsOpenForWrite(categoryId, pickId, now?)` is the guard every mutation runs through. It uses a Realtime Database **transaction** to atomically auto-close a pick whose `dueDate` has passed, then:

- throws `PickNotFoundError` (`code: "pick_not_found"`) if the pick does not exist;
- throws `PickWriteClosedError` (`code: "pick_closed"`) if the pick is closed — with a message distinguishing a freshly-passed due date from an already-closed pick;
- otherwise returns the open `GroupPick`.

`PICK_CLOSED_API_ERROR` (`"Pick is closed"`) is the string surfaced to API callers.

## Options

Options are owned by members (`ownerIds`), so the same option can represent several people who chose it.

- `addOption(pickId, title, ownerUid)` — create an option owned by the caller.
- `joinOption(pickId, optionId, ownerUid)` — add the caller to an existing option's owners.
- `unjoinOption(pickId, optionId, ownerUid)` — remove the caller; if they were the **last** owner, the whole option node is deleted. A transaction prevents two concurrent unjoins from both declining to delete and leaving an empty-owner option.

`removeOwnerFromPickOptions` (in [`pick.ts`](../src/lib/firebase/schema/pick.ts)) is the pure equivalent for in-memory option lists, dropping an owner and pruning options left with no owners.

## Data shape

`FirebasePickPublic` and `FirebaseOption` — see [the data model](data-model.md). `topCount` defaults to `1` and `closedAt` is validated on read.

## Related

- [Data model](data-model.md) · [Architecture overview](architecture.md)
- [Groups](groups.md) — picks belong to a category, which belongs to a group.
