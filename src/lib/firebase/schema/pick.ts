import type { GroupPick, PickOption } from "@/lib/types/pick";

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
}

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
  >,
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
  };
}

export function firebaseToPick(
  id: string,
  data: FirebasePickPublic,
): GroupPick {
  const isValidClosedAt =
    typeof data.closedAt === "number" &&
    Number.isFinite(data.closedAt) &&
    data.closedAt > 0 &&
    data.closedAt <= Date.now();

  const options =
    data.options === undefined
      ? undefined
      : Object.entries(data.options).map(([optionId, optionData]) =>
          firebaseToPickOption(optionId, optionData),
        );

  return {
    id,
    options,
    title: data.title,
    description: data.description,
    topCount: typeof data.topCount === "number" ? data.topCount : 1,
    dueDate:
      typeof data.dueDate === "number" ? new Date(data.dueDate) : undefined,
    categoryId: data.categoryId,
    createdAt: new Date(data.createdAt),
    creatorId: data.creatorId,
    closedAt:
      isValidClosedAt && data.closedAt !== undefined
        ? new Date(data.closedAt)
        : undefined,
    closedManually: data.closedManually,
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
