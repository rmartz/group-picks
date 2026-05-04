import type { Category } from "@/lib/types/category";

export interface FirebaseCategoryPublic {
  name: string;
  description: string;
  groupId: string;
  createdAt: number;
  creatorId: string;
}

export function categoryToFirebase(
  category: Pick<
    Category,
    "name" | "description" | "groupId" | "createdAt" | "creatorId"
  >,
): FirebaseCategoryPublic {
  return {
    name: category.name,
    description: category.description,
    groupId: category.groupId,
    createdAt: category.createdAt.getTime(),
    creatorId: category.creatorId,
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
  };
}
