import { z } from "zod";

import type { GroupPick, PickOption } from "@/lib/types/pick";
import { RankingMode } from "@/lib/types/pick";

export interface FirebasePickOption {
  ownerIds: string[];
  title: string;
}

export interface FirebasePickPublic {
  options?: Record<string, FirebasePickOption>;
  title: string;
  description?: string;
  topCount?: number;
  dueDate?: number;
  categoryId: string;
  closedAt?: number;
  closedManually?: boolean;
  createdAt: number;
  creatorId: string;
  rankingMode?: string;
  resultsVisible?: boolean;
}

const FirebasePickOptionSchema = z.object({
  ownerIds: z.array(z.string()),
  title: z.string(),
});

// Runtime shape of a persisted pick's public node, parsed on read. Optional and
// loosely-typed fields (topCount, rankingMode, closedAt) are normalised by the
// transform below, so the schema only enforces presence/type, not defaults.
const FirebasePickPublicSchema = z.object({
  options: z.record(z.string(), FirebasePickOptionSchema).optional(),
  title: z.string(),
  description: z.string().optional(),
  topCount: z.number().optional(),
  dueDate: z.number().optional(),
  categoryId: z.string(),
  // closedAt is sanitised post-parse (isValidClosedAt below): a non-finite or
  // out-of-range value means "still open", so NaN must pass the schema rather
  // than throw (Zod v4's z.number() rejects NaN by default).
  closedAt: z.union([z.number(), z.nan()]).optional(),
  closedManually: z.boolean().optional(),
  createdAt: z.number(),
  creatorId: z.string(),
  rankingMode: z.string().optional(),
  resultsVisible: z.boolean().optional(),
});

function pickOptionToFirebase(option: PickOption): FirebasePickOption {
  return {
    ownerIds: option.ownerIds,
    title: option.title,
  };
}

function firebaseToPickOption(
  optionId: string,
  optionData: FirebasePickOption,
): PickOption {
  return {
    id: optionId,
    ownerIds: optionData.ownerIds,
    title: optionData.title,
  };
}

export function pickToFirebase(
  pick: Pick<
    GroupPick,
    | "title"
    | "description"
    | "topCount"
    | "dueDate"
    | "categoryId"
    | "createdAt"
    | "creatorId"
    | "options"
    | "closedAt"
    | "closedManually"
    | "resultsVisible"
  > & { rankingMode?: RankingMode },
): FirebasePickPublic {
  const options =
    pick.options === undefined
      ? undefined
      : Object.fromEntries(
          pick.options.map((option) => [
            option.id,
            pickOptionToFirebase(option),
          ]),
        );

  return {
    options,
    title: pick.title,
    description: pick.description,
    topCount: pick.topCount,
    dueDate: pick.dueDate?.getTime(),
    categoryId: pick.categoryId,
    createdAt: pick.createdAt.getTime(),
    creatorId: pick.creatorId,
    closedAt: pick.closedAt?.getTime(),
    closedManually: pick.closedManually,
    rankingMode: pick.rankingMode,
    resultsVisible: pick.resultsVisible,
  };
}

export function firebaseToPick(id: string, data: unknown): GroupPick {
  const parsed = FirebasePickPublicSchema.parse(data);

  const isValidClosedAt =
    typeof parsed.closedAt === "number" &&
    Number.isFinite(parsed.closedAt) &&
    parsed.closedAt > 0 &&
    parsed.closedAt <= Date.now();

  const options =
    parsed.options === undefined
      ? undefined
      : Object.entries(parsed.options).map(([optionId, optionData]) =>
          firebaseToPickOption(optionId, optionData),
        );

  const rankingMode =
    parsed.rankingMode === RankingMode.StackRank
      ? RankingMode.StackRank
      : parsed.rankingMode === RankingMode.HeadToHead
        ? RankingMode.HeadToHead
        : RankingMode.TierBuckets;

  return {
    id,
    options,
    title: parsed.title,
    description: parsed.description,
    topCount: typeof parsed.topCount === "number" ? parsed.topCount : 1,
    dueDate:
      typeof parsed.dueDate === "number" ? new Date(parsed.dueDate) : undefined,
    categoryId: parsed.categoryId,
    createdAt: new Date(parsed.createdAt),
    creatorId: parsed.creatorId,
    closedAt:
      isValidClosedAt && parsed.closedAt !== undefined
        ? new Date(parsed.closedAt)
        : undefined,
    closedManually: parsed.closedManually,
    rankingMode,
    resultsVisible: parsed.resultsVisible !== false,
  };
}

export function removeOwnerFromPickOptions(
  options: readonly PickOption[],
  optionId: string,
  ownerId: string,
): PickOption[] {
  return options
    .map((option) => {
      if (option.id !== optionId) return option;

      const ownerIds = option.ownerIds.filter((id) => id !== ownerId);
      if (ownerIds.length === 0) return undefined;

      return { ...option, ownerIds };
    })
    .filter((option): option is PickOption => option !== undefined);
}
