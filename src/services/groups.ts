export class LeaveGroupLastMemberError extends Error {}

export async function leaveGroup(groupId: string): Promise<void> {
  const response = await fetch(`/api/groups/${groupId}`, { method: "DELETE" });
  if (response.status === 409) throw new LeaveGroupLastMemberError();
  if (!response.ok) throw new Error("Failed to leave group");
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
