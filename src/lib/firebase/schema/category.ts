import type { Category } from "@/lib/types/category";

export interface FirebaseCategoryPublic {
  groupId: string;
  name: string;
  createdAt: number;
}

export function categoryToFirebase(
  category: Pick<Category, "groupId" | "name" | "createdAt">,
): FirebaseCategoryPublic {
  return {
    groupId: category.groupId,
    name: category.name,
    createdAt: category.createdAt.getTime(),
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
    createdAt: new Date(data.createdAt),
  };
}
