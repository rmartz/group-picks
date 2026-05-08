export async function closePick(
  groupId: string,
  categoryId: string,
  pickId: string,
): Promise<void> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}/picks/${pickId}/close`,
    { method: "POST" },
  );
  if (!response.ok) throw new Error("Failed to close pick");
}

export async function reopenPick(
  groupId: string,
  categoryId: string,
  pickId: string,
): Promise<void> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}/picks/${pickId}/reopen`,
    { method: "POST" },
  );
  if (!response.ok) throw new Error("Failed to reopen pick");
}
