import { randomBytes } from "crypto";
import { getDatabase } from "firebase-admin/database";
import { getAdminApp } from "@/lib/firebase/admin";
import {
  firebaseToGroupInvite,
  groupInviteToFirebase,
  type FirebaseGroupInvite,
} from "@/lib/firebase/schema/invite";
import type { GroupInvite } from "@/lib/types/invite";

function isFirebaseGroupInvite(data: unknown): data is FirebaseGroupInvite {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d["groupId"] === "string" &&
    typeof d["createdAt"] === "number" &&
    (d["expiresAt"] === null || typeof d["expiresAt"] === "number") &&
    typeof d["active"] === "boolean"
  );
}

export async function getGroupInviteByToken(
  token: string,
): Promise<GroupInvite | undefined> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`invites/${token}`).get();
  if (!snap.exists()) return undefined;
  const raw: unknown = snap.val();
  if (!isFirebaseGroupInvite(raw)) return undefined;
  return firebaseToGroupInvite(token, raw);
}

export async function getGroupInviteByGroupId(
  groupId: string,
): Promise<GroupInvite | undefined> {
  const db = getDatabase(getAdminApp());
  const tokenSnap = await db.ref(`groups/${groupId}/inviteToken`).get();
  if (!tokenSnap.exists()) return undefined;
  const token = tokenSnap.val() as string;
  return getGroupInviteByToken(token);
}

export async function createGroupInvite(groupId: string): Promise<GroupInvite> {
  const db = getDatabase(getAdminApp());
  const token = randomBytes(24).toString("base64url");
  const invite: GroupInvite = {
    token,
    groupId,
    createdAt: new Date(),
    expiresAt: undefined,
    active: true,
  };
  await db.ref(`invites/${token}`).set(groupInviteToFirebase(invite));
  await db.ref(`groups/${groupId}/inviteToken`).set(token);
  return invite;
}

export async function getOrCreateGroupInvite(
  groupId: string,
): Promise<GroupInvite> {
  const existing = await getGroupInviteByGroupId(groupId);
  if (existing) return existing;
  return createGroupInvite(groupId);
}

export async function setGroupInviteExpiry(
  groupId: string,
  expiresAt: Date | undefined,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  const tokenSnap = await db.ref(`groups/${groupId}/inviteToken`).get();
  if (!tokenSnap.exists()) return;
  const token = tokenSnap.val() as string;
  await db.ref(`invites/${token}/expiresAt`).set(expiresAt?.getTime() ?? null);
}

export async function addGroupMember(
  groupId: string,
  uid: string,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  await db.ref(`groups/${groupId}/members/${uid}`).set(true);
}
