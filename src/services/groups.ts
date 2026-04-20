export async function createGroup(name: string): Promise<string> {
  const response = await fetch("/api/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error("Failed to create group");
  const data = (await response.json()) as { groupId: string };
  return data.groupId;
}
