import type { Category } from "@/lib/types/category";

export interface FirebaseCategoryPublic {
  groupId: string;
  name: string;
  description: string;
  createdAt: number;
  creatorId: string;
}

export function categoryToFirebase(
  category: Pick<
    Category,
    "groupId" | "name" | "description" | "createdAt" | "creatorId"
  >,
): FirebaseCategoryPublic {
  return {
    groupId: category.groupId,
    name: category.name,
    description: category.description,
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
    groupId: data.groupId,
    name: data.name,
    description: data.description,
    createdAt: new Date(data.createdAt),
    creatorId: data.creatorId,
  };
}
