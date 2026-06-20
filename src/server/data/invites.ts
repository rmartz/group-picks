import { randomUUID } from "crypto";
import { getDatabase } from "firebase-admin/database";

import { getAdminApp } from "@/lib/firebase/admin";
import {
  firebaseToGroupInvite,
  groupInviteToFirebase,
} from "@/lib/firebase/schema/invite";
import { type GroupInvite, InviteMode } from "@/lib/types/invite";

export const INVITE_TTL_PERSONAL = 7 * 24 * 60 * 60 * 1000;
export const INVITE_TTL_GROUP = 30 * 24 * 60 * 60 * 1000;

export type CreatedGroupInvite = GroupInvite & { expiresAt: Date };

export async function getGroupInviteByToken(
  token: string,
): Promise<GroupInvite | undefined> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`invites/${token}`).get();
  if (!snap.exists()) return undefined;
  // A malformed invite node is treated as "no such invite" (404) rather than
  // an error, so the converter's parse is caught here and mapped to undefined.
  try {
    return firebaseToGroupInvite(token, snap.val());
  } catch {
    return undefined;
  }
}

export async function createGroupInvite(
  groupId: string,
  oldToken: string | undefined,
  mode: InviteMode,
  createdBy: string,
): Promise<CreatedGroupInvite> {
  const db = getDatabase(getAdminApp());

  const token = randomUUID().replace(/-/g, "");
  const createdAt = new Date();
  const ttl =
    mode === InviteMode.Personal ? INVITE_TTL_PERSONAL : INVITE_TTL_GROUP;
  const expiresAt = new Date(createdAt.getTime() + ttl);

  const invite: CreatedGroupInvite = {
    token,
    groupId,
    createdAt,
    expiresAt,
    active: true,
    mode,
    createdBy,
  };

  const updates: Record<string, unknown> = {
    [`invites/${token}`]: groupInviteToFirebase(invite),
    [`groups/${groupId}/public/inviteToken`]: token,
  };
  if (oldToken) {
    updates[`invites/${oldToken}/active`] = false;
  }

  await db.ref().update(updates);

  return invite;
}

export async function revokeGroupInvite(token: string): Promise<void> {
  const db = getDatabase(getAdminApp());
  await db.ref(`invites/${token}/active`).set(false);
}

export async function addGroupMember(
  groupId: string,
  uid: string,
  revokeToken?: string,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  if (revokeToken) {
    await db.ref().update({
      [`groups/${groupId}/members/${uid}`]: true,
      [`users/${uid}/groups/${groupId}`]: true,
      [`invites/${revokeToken}/active`]: false,
    });
  } else {
    await db.ref().update({
      [`groups/${groupId}/members/${uid}`]: true,
      [`users/${uid}/groups/${groupId}`]: true,
    });
  }
}
