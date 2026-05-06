import type { GroupPick } from "@/lib/types/pick";

export interface FirebasePickPublic {
  title: string;
  description?: string;
  categoryId: string;
  createdAt: number;
  creatorId: string;
}

export function pickToFirebase(
  pick: Pick<
    GroupPick,
    "title" | "description" | "categoryId" | "createdAt" | "creatorId"
  >,
): FirebasePickPublic {
  return {
    title: pick.title,
    description: pick.description,
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
    categoryId: data.categoryId,
    createdAt: new Date(data.createdAt),
    creatorId: data.creatorId,
  };
}
