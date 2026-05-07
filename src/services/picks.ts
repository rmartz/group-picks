export async function updatePick(
  groupId: string,
  categoryId: string,
  pickId: string,
  title: string,
  description: string,
  topCount: number,
  dueDate: Date | undefined,
): Promise<void> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}/picks/${pickId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        topCount,
        dueDate: dueDate?.toISOString(),
      }),
    },
  );

  if (!response.ok) throw new Error("Failed to update pick");
}
