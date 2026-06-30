export async function createSnapPick(
  groupId: string,
  categoryId: string,
  title: string,
): Promise<{ snapPickId: string; createdAt: Date }> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}/snap-picks`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    },
  );
  if (!response.ok) throw new Error("Failed to create snap pick");
  const data = (await response.json()) as {
    snapPickId: string;
    createdAt: string;
  };
  return { snapPickId: data.snapPickId, createdAt: new Date(data.createdAt) };
}
