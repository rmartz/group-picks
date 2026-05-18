import { type GroupInvite, InviteMode } from "@/lib/types/invite";

export interface FirebaseGroupInvite {
  groupId: string;
  createdAt: number;
  expiresAt: number | null;
  active: boolean;
  mode?: InviteMode;
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
    mode: data.mode ?? InviteMode.Group,
  };
}
