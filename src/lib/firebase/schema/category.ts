import type { Category } from "@/lib/types/category";

export interface FirebaseCategory {
  name: string;
  createdAt: number;
  creatorId: string;
  description?: string;
}

export function categoryToFirebase(
  category: Pick<Category, "name" | "description" | "createdAt" | "creatorId">,
): FirebaseCategory {
  const result: FirebaseCategory = {
    name: category.name,
    createdAt: category.createdAt.getTime(),
    creatorId: category.creatorId,
  };
  if (category.description !== undefined) {
    result.description = category.description;
  }
  return result;
}

export function firebaseToCategory(
  id: string,
  groupId: string,
  data: FirebaseCategory,
): Category {
  return {
    id,
    groupId,
    name: data.name,
    description: data.description,
    createdAt: new Date(data.createdAt),
    creatorId: data.creatorId,
  };
}
