import { PickStatus, type GroupPick } from "@/lib/types/pick";

export interface FirebasePickPublic {
  title: string;
  description?: string;
  categoryId: string;
  status: string;
  dueDate?: number | null;
  createdAt: number;
  creatorId: string;
}

export function pickToFirebase(
  pick: Pick<
    GroupPick,
    | "title"
    | "description"
    | "categoryId"
    | "status"
    | "dueDate"
    | "createdAt"
    | "creatorId"
  >,
): FirebasePickPublic {
  return {
    title: pick.title,
    description: pick.description,
    categoryId: pick.categoryId,
    status: pick.status,
    dueDate: pick.dueDate?.getTime() ?? null,
    createdAt: pick.createdAt.getTime(),
    creatorId: pick.creatorId,
  };
}

const VALID_PICK_STATUSES = new Set<string>(Object.values(PickStatus));

export function firebaseToPick(
  id: string,
  data: FirebasePickPublic,
): GroupPick {
  const status = VALID_PICK_STATUSES.has(data.status)
    ? (data.status as PickStatus)
    : PickStatus.Open;
  return {
    id,
    title: data.title,
    description: data.description,
    categoryId: data.categoryId,
    status,
    dueDate: data.dueDate != null ? new Date(data.dueDate) : undefined,
    createdAt: new Date(data.createdAt),
    creatorId: data.creatorId,
  };
}
