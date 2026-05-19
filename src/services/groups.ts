import { InviteMode } from "@/lib/types/invite";

export class LeaveGroupLastMemberError extends Error {}

export async function leaveGroup(groupId: string): Promise<void> {
  const response = await fetch(`/api/groups/${groupId}`, { method: "DELETE" });
  if (response.status === 409) throw new LeaveGroupLastMemberError();
  if (!response.ok) throw new Error("Failed to leave group");
}

export async function joinGroup(token: string): Promise<string> {
  const response = await fetch("/api/groups/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) throw new Error("Failed to join group");

  const contentType = response.headers.get("content-type");
  if (response.redirected || !contentType?.includes("application/json")) {
    throw new Error("Failed to join group");
  }

  const data = (await response.json()) as { groupId: string };
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

export async function regenerateInvite(
  groupId: string,
  mode: InviteMode,
): Promise<{ token: string; expiresAt: string; mode: InviteMode }> {
  const response = await fetch(`/api/groups/${groupId}/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }),
  });
  if (!response.ok) throw new Error("Failed to regenerate invite");

  const contentType = response.headers.get("content-type");
  if (response.redirected || !contentType?.includes("application/json")) {
    throw new Error("Failed to regenerate invite");
  }

  return (await response.json()) as {
    token: string;
    expiresAt: string;
    mode: InviteMode;
  };
}

export async function promoteAdmin(
  groupId: string,
  uid: string,
): Promise<void> {
  const response = await fetch(`/api/groups/${groupId}/admins`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid }),
  });
  if (!response.ok) throw new Error("Failed to promote admin");
}

export async function revokeAdmin(groupId: string, uid: string): Promise<void> {
  const response = await fetch(`/api/groups/${groupId}/admins/${uid}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to revoke admin");
}

export async function updateGroupSettings(
  groupId: string,
  settings: { picksRestricted: boolean },
): Promise<void> {
  const response = await fetch(`/api/groups/${groupId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error("Failed to update group settings");
}

export async function removeGroupMember(
  groupId: string,
  uid: string,
): Promise<void> {
  const response = await fetch(`/api/groups/${groupId}/members/${uid}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to remove member");
}

export async function updateInviteExpiry(
  groupId: string,
  expiresAt: string | null,
): Promise<{ expiresAt: string | null }> {
  const response = await fetch(`/api/groups/${groupId}/invite`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expiresAt }),
  });
  if (!response.ok) throw new Error("Failed to update invite expiry");

  const contentType = response.headers.get("content-type");
  if (response.redirected || !contentType?.includes("application/json")) {
    throw new Error("Failed to update invite expiry");
  }

  return (await response.json()) as { expiresAt: string | null };
}
