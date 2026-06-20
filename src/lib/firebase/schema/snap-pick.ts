// Snap Pick schema boundary.
//
// A Snap Pick has two distinct entities at two Realtime Database paths:
//   - the container:  snap-picks/{categoryId}/{snapPickId}        (FirebaseSnapPick)
//   - an activation:  snap-pick-activations/{snapPickId}/{activationId}
//                                                                 (FirebaseSnapPickActivation)
// The container is long-lived (holds the option pool and history); each activation
// is one run of the head-to-head vote, with a start time, a close time, and a winner.
//
// Domain types use Date; the persisted shapes use epoch-millisecond numbers.

import type { SnapPick, SnapPickActivation } from "@/lib/types/snap-pick";

export interface FirebaseSnapPick {
  title: string;
  categoryId: string;
  createdAt: number;
  creatorId: string;
  defaultDurationMs: number;
}

export interface FirebaseSnapPickActivation {
  snapPickId: string;
  startedAt: number;
  closesAt: number;
  closedAt?: number;
  winnerId?: string;
  startedBy: string;
}

export function snapPickToFirebase(
  snapPick: Pick<
    SnapPick,
    "title" | "categoryId" | "createdAt" | "creatorId" | "defaultDurationMs"
  >,
): FirebaseSnapPick {
  return {
    title: snapPick.title,
    categoryId: snapPick.categoryId,
    createdAt: snapPick.createdAt.getTime(),
    creatorId: snapPick.creatorId,
    defaultDurationMs: snapPick.defaultDurationMs,
  };
}

export function firebaseToSnapPick(
  id: string,
  data: FirebaseSnapPick,
): SnapPick {
  return {
    id,
    title: data.title,
    categoryId: data.categoryId,
    createdAt: new Date(data.createdAt),
    creatorId: data.creatorId,
    defaultDurationMs: data.defaultDurationMs,
  };
}

export function snapPickActivationToFirebase(
  activation: Pick<
    SnapPickActivation,
    | "snapPickId"
    | "startedAt"
    | "closesAt"
    | "closedAt"
    | "winnerId"
    | "startedBy"
  >,
): FirebaseSnapPickActivation {
  return {
    snapPickId: activation.snapPickId,
    startedAt: activation.startedAt.getTime(),
    closesAt: activation.closesAt.getTime(),
    closedAt: activation.closedAt?.getTime(),
    winnerId: activation.winnerId,
    startedBy: activation.startedBy,
  };
}

export function firebaseToSnapPickActivation(
  id: string,
  data: FirebaseSnapPickActivation,
): SnapPickActivation {
  return {
    id,
    snapPickId: data.snapPickId,
    startedAt: new Date(data.startedAt),
    closesAt: new Date(data.closesAt),
    closedAt: data.closedAt !== undefined ? new Date(data.closedAt) : undefined,
    winnerId: data.winnerId,
    startedBy: data.startedBy,
  };
}
