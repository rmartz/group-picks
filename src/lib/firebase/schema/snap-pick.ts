// Snap Pick schema boundary.
//
// A Snap Pick has three distinct entities at three Realtime Database paths:
//   - the container:  snap-picks/{categoryId}/{snapPickId}        (FirebaseSnapPick)
//   - an option:      snap-pick-options/{snapPickId}/{optionId}   (FirebaseSnapPickOption)
//   - an activation:  snap-pick-activations/{snapPickId}/{activationId}
//                                                                 (FirebaseSnapPickActivation)
// The container is long-lived (holds the option pool and history); an option is a
// member-curated entry in that persistent pool (soft-deleted via removedAt so it
// stays readable in historical activations); each activation is one run of the
// head-to-head vote, with a start time, a close time, and a winner.
//
// Domain types use Date; the persisted shapes use epoch-millisecond numbers.

import { z } from "zod";

import type {
  SnapPick,
  SnapPickActivation,
  SnapPickOption,
} from "@/lib/types/snap-pick";

export interface FirebaseSnapPick {
  title: string;
  categoryId: string;
  createdAt: number;
  creatorId: string;
  defaultDurationMs: number;
}

export interface FirebaseSnapPickOption {
  title: string;
  addedBy: string;
  addedAt: number;
  removedAt?: number;
}

export interface FirebaseSnapPickActivation {
  snapPickId: string;
  startedAt: number;
  closesAt: number;
  closedAt?: number;
  winnerId?: string;
  startedBy: string;
}

// Runtime shapes of the persisted nodes, parsed on read so a malformed document
// fails loudly instead of producing silent undefined/null bugs.
const FirebaseSnapPickSchema = z.object({
  title: z.string(),
  categoryId: z.string(),
  createdAt: z.number(),
  creatorId: z.string(),
  defaultDurationMs: z.number(),
});

const FirebaseSnapPickOptionSchema = z.object({
  title: z.string(),
  addedBy: z.string(),
  addedAt: z.number(),
  removedAt: z.number().optional(),
});

const FirebaseSnapPickActivationSchema = z.object({
  snapPickId: z.string(),
  startedAt: z.number(),
  closesAt: z.number(),
  closedAt: z.number().optional(),
  winnerId: z.string().optional(),
  startedBy: z.string(),
});

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

export function firebaseToSnapPick(id: string, data: unknown): SnapPick {
  const parsed = FirebaseSnapPickSchema.parse(data);
  return {
    id,
    title: parsed.title,
    categoryId: parsed.categoryId,
    createdAt: new Date(parsed.createdAt),
    creatorId: parsed.creatorId,
    defaultDurationMs: parsed.defaultDurationMs,
  };
}

export function snapPickOptionToFirebase(
  option: Pick<SnapPickOption, "title" | "addedBy" | "addedAt" | "removedAt">,
): FirebaseSnapPickOption {
  return {
    title: option.title,
    addedBy: option.addedBy,
    addedAt: option.addedAt.getTime(),
    removedAt: option.removedAt?.getTime(),
  };
}

export function firebaseToSnapPickOption(
  id: string,
  data: unknown,
): SnapPickOption {
  const parsed = FirebaseSnapPickOptionSchema.parse(data);
  return {
    id,
    title: parsed.title,
    addedBy: parsed.addedBy,
    addedAt: new Date(parsed.addedAt),
    removedAt:
      parsed.removedAt !== undefined ? new Date(parsed.removedAt) : undefined,
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
  data: unknown,
): SnapPickActivation {
  const parsed = FirebaseSnapPickActivationSchema.parse(data);
  return {
    id,
    snapPickId: parsed.snapPickId,
    startedAt: new Date(parsed.startedAt),
    closesAt: new Date(parsed.closesAt),
    closedAt:
      parsed.closedAt !== undefined ? new Date(parsed.closedAt) : undefined,
    winnerId: parsed.winnerId,
    startedBy: parsed.startedBy,
  };
}
