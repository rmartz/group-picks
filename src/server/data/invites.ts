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

export async function createGroupInvite(
  groupId: string,
  oldToken: string | undefined,
): Promise<string> {
  const db = getDatabase(getAdminApp());

  if (oldToken) {
    await db.ref(`invites/${oldToken}/active`).set(false);
  }

  const token = crypto.randomUUID().replace(/-/g, "");

  await db.ref(`invites/${token}`).set(
    groupInviteToFirebase({
      groupId,
      createdAt: new Date(),
      expiresAt: undefined,
      active: true,
    }),
  );

  await db.ref(`groups/${groupId}/public/inviteToken`).set(token);

  return token;
}

export async function addGroupMember(
  groupId: string,
  uid: string,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  await db.ref(`groups/${groupId}/members/${uid}`).set(true);
}
