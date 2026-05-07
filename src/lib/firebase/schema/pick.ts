import type { GroupPick } from "@/lib/types/pick";

export interface FirebasePickPublic {
  title: string;
  description?: string;
  topCount?: number;
  dueDate?: number;
  categoryId: string;
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
    topCount: typeof data.topCount === "number" ? data.topCount : 1,
    dueDate:
      typeof data.dueDate === "number" ? new Date(data.dueDate) : undefined,
    categoryId: data.categoryId,
    createdAt: new Date(data.createdAt),
    creatorId: data.creatorId,
  };
}
