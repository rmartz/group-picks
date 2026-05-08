import type { GroupPick } from "@/lib/types/pick";

export interface FirebasePickPublic {
  title: string;
  description?: string;
  categoryId: string;
  createdAt: number;
  creatorId: string;
  dueDate?: number;
  closedAt?: number;
  closedManually?: boolean;
}

export function pickToFirebase(
  pick: Pick<
    GroupPick,
    | "title"
    | "description"
    | "categoryId"
    | "createdAt"
    | "creatorId"
    | "dueDate"
    | "closedAt"
    | "closedManually"
  >,
): FirebasePickPublic {
  return {
    title: pick.title,
    description: pick.description,
    categoryId: pick.categoryId,
    createdAt: pick.createdAt.getTime(),
    creatorId: pick.creatorId,
    dueDate: pick.dueDate?.getTime(),
    closedAt: pick.closedAt?.getTime(),
    closedManually: pick.closedManually,
  };
}

export function firebaseToPick(
  id: string,
  data: FirebasePickPublic,
): GroupPick {
  const dueDate =
    data.dueDate !== undefined ? new Date(data.dueDate) : undefined;
  const closedAt =
    data.closedAt !== undefined ? new Date(data.closedAt) : undefined;

  return {
    id,
    title: data.title,
    description: data.description,
    categoryId: data.categoryId,
    createdAt: new Date(data.createdAt),
    creatorId: data.creatorId,
    dueDate,
    closedAt,
    closedManually: data.closedManually,
  };
}
