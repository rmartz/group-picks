import type { GroupPick } from "@/lib/types/pick";

export interface FirebasePickPublic {
  title: string;
  description?: string;
  categoryId: string;
  createdAt: number;
  creatorId: string;
  dueDate?: number;
  closedAt?: number;
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
  };
}

export function firebaseToPick(
  id: string,
  data: FirebasePickPublic,
): GroupPick {
  return {
    id,
    title: data.title,
    description: data.description,
    categoryId: data.categoryId,
    createdAt: new Date(data.createdAt),
    creatorId: data.creatorId,
    dueDate: data.dueDate === undefined ? undefined : new Date(data.dueDate),
    closedAt: data.closedAt === undefined ? undefined : new Date(data.closedAt),
  };
}
