import type { GroupPick } from "@/lib/types/pick";

export interface FirebasePickPublic {
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
    | "closedAt"
    | "closedManually"
  >,
): FirebasePickPublic {
  return {
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

  return {
    id,
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
