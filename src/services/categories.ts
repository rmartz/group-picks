import type { Category } from "@/lib/types/category";

interface ApiCategory {
  id: string;
  groupId: string;
  name: string;
  description?: string;
  createdAt: string;
  creatorId: string;
}

export class CategoryHasPicksError extends Error {
  constructor() {
    super("Category has picks");
    this.name = "CategoryHasPicksError";
  }
}

export async function getGroupCategories(groupId: string): Promise<Category[]> {
  const response = await fetch(`/api/groups/${groupId}/categories`);
  if (!response.ok) throw new Error("Failed to fetch categories");
  const data = (await response.json()) as { categories: ApiCategory[] };
  return data.categories.map((c) => ({
    ...c,
    createdAt: new Date(c.createdAt),
  }));
}

export async function createCategory(
  groupId: string,
  name: string,
  description: string,
): Promise<{ categoryId: string; creatorId: string; createdAt: Date }> {
  const response = await fetch(`/api/groups/${groupId}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
  if (!response.ok) throw new Error("Failed to create category");

  const contentType = response.headers.get("content-type");
  if (response.redirected || !contentType?.includes("application/json")) {
    throw new Error("Failed to create category");
  }

  const data = (await response.json()) as {
    categoryId: string;
    creatorId: string;
    createdAt: string;
  };
  return {
    categoryId: data.categoryId,
    creatorId: data.creatorId,
    createdAt: new Date(data.createdAt),
  };
}

export async function updateCategory(
  groupId: string,
  categoryId: string,
  name: string,
  description: string,
): Promise<void> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    },
  );
  if (!response.ok) throw new Error("Failed to update category");
}

export async function deleteCategory(
  groupId: string,
  categoryId: string,
): Promise<void> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}`,
    { method: "DELETE" },
  );
  if (response.status === 409) {
    throw new CategoryHasPicksError();
  }
  if (!response.ok) throw new Error("Failed to delete category");
}
