import { z } from "zod";

import type { Category } from "@/lib/types/category";

export interface FirebaseCategoryPublic {
  name: string;
  description?: string;
  groupId: string;
  createdAt: number;
  creatorId: string;
}

// Runtime shape of a persisted category's public node, parsed on read.
const FirebaseCategoryPublicSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  groupId: z.string(),
  createdAt: z.number(),
  creatorId: z.string(),
});

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

export function firebaseToCategory(id: string, data: unknown): Category {
  const parsed = FirebaseCategoryPublicSchema.parse(data);
  return {
    id,
    name: parsed.name,
    description: parsed.description,
    groupId: parsed.groupId,
    createdAt: new Date(parsed.createdAt),
    creatorId: parsed.creatorId,
  };
}
