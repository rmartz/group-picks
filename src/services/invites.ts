export async function setInviteExpiry(
  groupId: string,
  expiresAt: string | null,
): Promise<void> {
  const response = await fetch(`/api/groups/${groupId}/invite`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expiresAt }),
  });
  if (!response.ok) throw new Error("Failed to update invite expiry");
}
