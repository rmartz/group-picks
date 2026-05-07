export async function createPick(
  groupId: string,
  categoryId: string,
  name: string,
  description: string,
  topCount: number,
  dueDate?: string,
): Promise<{ pickId: string; creatorId: string; createdAt: Date }> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}/picks`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, topCount, dueDate }),
    },
  );
  if (!response.ok) throw new Error("Failed to create pick");

  const contentType = response.headers.get("content-type");
  if (response.redirected || !contentType?.includes("application/json")) {
    throw new Error("Failed to create pick");
  }

  const data = (await response.json()) as {
    pickId: string;
    creatorId: string;
    createdAt: string;
  };
  return {
    pickId: data.pickId,
    creatorId: data.creatorId,
    createdAt: new Date(data.createdAt),
  };
}
