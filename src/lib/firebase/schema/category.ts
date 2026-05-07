import type { Category } from "@/lib/types/category";

export interface FirebaseCategoryPublic {
  name: string;
  description?: string;
  groupId: string;
  createdAt: number;
  creatorId: string;
  topPickCount?: number;
  rankedBallots?: string[][];
  rankedCount?: number;
  totalCount?: number;
  closesAt?: number;
  closedAt?: number;
}

export function categoryToFirebase(
  category: Pick<
    Category,
    | "name"
    | "description"
    | "groupId"
    | "createdAt"
    | "creatorId"
    | "topPickCount"
    | "rankedBallots"
    | "rankedCount"
    | "totalCount"
    | "closesAt"
    | "closedAt"
  >,
): FirebaseCategoryPublic {
  return {
    name: category.name,
    description: category.description,
    groupId: category.groupId,
    createdAt: category.createdAt.getTime(),
    creatorId: category.creatorId,
    topPickCount: category.topPickCount,
    rankedBallots: category.rankedBallots,
    rankedCount: category.rankedCount,
    totalCount: category.totalCount,
    closesAt: category.closesAt?.getTime(),
    closedAt: category.closedAt?.getTime(),
  };
}

export function firebaseToCategory(
  id: string,
  data: FirebaseCategoryPublic,
): Category {
  return {
    id,
    name: data.name,
    description: data.description,
    groupId: data.groupId,
    createdAt: new Date(data.createdAt),
    creatorId: data.creatorId,
    topPickCount: data.topPickCount,
    rankedBallots: data.rankedBallots,
    rankedCount: data.rankedCount,
    totalCount: data.totalCount,
    closesAt: data.closesAt !== undefined ? new Date(data.closesAt) : undefined,
    closedAt: data.closedAt !== undefined ? new Date(data.closedAt) : undefined,
  };
}
