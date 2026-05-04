import { getDatabase } from "firebase-admin/database";
import { getAdminApp } from "@/lib/firebase/admin";
import {
  firebaseToGroupInvite,
  type FirebaseGroupInvite,
} from "@/lib/firebase/schema/invite";
import type { GroupInvite } from "@/lib/types/invite";

export async function getGroupInviteByToken(
  token: string,
): Promise<GroupInvite | undefined> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`invites/${token}`).get();
  if (!snap.exists()) return undefined;
  return firebaseToGroupInvite(token, snap.val() as FirebaseGroupInvite);
}

export async function addGroupMember(
  groupId: string,
  uid: string,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  await db.ref(`groups/${groupId}/members/${uid}`).set(true);
}
