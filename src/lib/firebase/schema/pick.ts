import type { GroupPick } from "@/lib/types/pick";

export interface FirebasePickPublic {
  title: string;
  description?: string;
  categoryId: string;
  createdAt: number;
  creatorId: string;
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
    closedAt: pick.closedAt?.getTime(),
    closedManually: pick.closedManually,
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
    closedAt: data.closedAt !== undefined ? new Date(data.closedAt) : undefined,
    closedManually: data.closedManually,
  };
}
