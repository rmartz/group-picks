import { PickStatus, type GroupPick } from "@/lib/types/pick";

export interface FirebasePickPublic {
  categoryId: string;
  closedAt?: number;
  createdAt: number;
  creatorId: string;
  description?: string;
  status?: PickStatus;
  title: string;
}

export function pickToFirebase(
  pick: Pick<
    GroupPick,
    | "title"
    | "description"
    | "categoryId"
    | "createdAt"
    | "creatorId"
    | "status"
    | "closedAt"
  >,
): FirebasePickPublic {
  return {
    categoryId: pick.categoryId,
    closedAt: pick.closedAt?.getTime(),
    createdAt: pick.createdAt.getTime(),
    creatorId: pick.creatorId,
    description: pick.description,
    status: pick.status,
    title: pick.title,
  };
}

export function firebaseToPick(
  id: string,
  data: FirebasePickPublic,
): GroupPick {
  return {
    id,
    categoryId: data.categoryId,
    closedAt:
      typeof data.closedAt === "number" ? new Date(data.closedAt) : undefined,
    createdAt: new Date(data.createdAt),
    creatorId: data.creatorId,
    description: data.description,
    status: data.status ?? PickStatus.Open,
    title: data.title,
  };
}
