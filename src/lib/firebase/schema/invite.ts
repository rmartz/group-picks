import { type GroupInvite, InviteMode } from "@/lib/types/invite";

export interface FirebaseGroupInvite {
  groupId: string;
  createdAt: number;
  expiresAt: number | null;
  active: boolean;
  mode?: InviteMode;
}

function isInviteMode(value: unknown): value is InviteMode {
  return (
    typeof value === "string" &&
    (Object.values(InviteMode) as string[]).includes(value)
  );
}

export function groupInviteToFirebase(
  invite: Pick<
    GroupInvite,
    "groupId" | "createdAt" | "expiresAt" | "active" | "mode"
  >,
): FirebaseGroupInvite {
  return {
    groupId: invite.groupId,
    createdAt: invite.createdAt.getTime(),
    expiresAt: invite.expiresAt?.getTime() ?? null,
    active: invite.active,
    mode: invite.mode,
  };
}

export function firebaseToGroupInvite(
  token: string,
  data: FirebaseGroupInvite,
): GroupInvite {
  return {
    token,
    groupId: data.groupId,
    createdAt: new Date(data.createdAt),
    expiresAt: data.expiresAt !== null ? new Date(data.expiresAt) : undefined,
    active: data.active,
    mode: isInviteMode(data.mode) ? data.mode : InviteMode.Group,
  };
}
