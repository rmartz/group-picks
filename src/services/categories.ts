export async function createCategory(
  groupId: string,
  name: string,
  description: string,
): Promise<string> {
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

  const data = (await response.json()) as { categoryId: string };
  return data.categoryId;
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
