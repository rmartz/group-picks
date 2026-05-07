import type { GroupPick } from "@/lib/types/pick";

export interface FirebasePickPublic {
  title: string;
  description?: string;
  dueAt?: number;
  topCount: number;
  categoryId: string;
  createdAt: number;
  creatorId: string;
}

export function pickToFirebase(
  pick: Pick<
    GroupPick,
    | "title"
    | "description"
    | "dueAt"
    | "topCount"
    | "categoryId"
    | "createdAt"
    | "creatorId"
  >,
): FirebasePickPublic {
  return {
    title: pick.title,
    description: pick.description,
    dueAt: pick.dueAt?.getTime(),
    topCount: pick.topCount,
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
    dueAt: data.dueAt !== undefined ? new Date(data.dueAt) : undefined,
    topCount: data.topCount,
    categoryId: data.categoryId,
    createdAt: new Date(data.createdAt),
    creatorId: data.creatorId,
  };
}
