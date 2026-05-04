export async function joinGroup(token: string): Promise<string> {
  const response = await fetch("/api/groups/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const data = (await response.json()) as { groupId?: string; error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to join group");
  }

  if (!data.groupId) {
    throw new Error("Failed to join group");
  }

  return data.groupId;
}

export async function createGroup(name: string): Promise<string> {
  const response = await fetch("/api/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error("Failed to create group");

  const contentType = response.headers.get("content-type");
  if (response.redirected || !contentType?.includes("application/json")) {
    throw new Error("Failed to create group");
  }

  const data = (await response.json()) as { groupId: string };
  return data.groupId;
}
