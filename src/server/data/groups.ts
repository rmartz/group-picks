import { getDatabase } from "firebase-admin/database";
import { getAdminApp, getAdminAuth } from "@/lib/firebase/admin";
import {
  firebaseToGroup,
  type FirebaseGroupPublic,
} from "@/lib/firebase/schema/group";
import type { Group } from "@/lib/types/group";

export async function getGroupById(id: string): Promise<Group | undefined> {
  const db = getDatabase(getAdminApp());

  const [publicSnap, membersSnap] = await Promise.all([
    db.ref(`groups/${id}/public`).get(),
    db.ref(`groups/${id}/members`).get(),
  ]);

  if (!publicSnap.exists()) return undefined;

  const publicData = publicSnap.val() as FirebaseGroupPublic;
  const memberIds = membersSnap.exists()
    ? Object.keys(membersSnap.val() as Record<string, unknown>)
    : [];

  return firebaseToGroup(id, publicData, memberIds);
}

export async function getMemberDisplayNames(
  uids: string[],
): Promise<{ uid: string; name: string }[]> {
  if (uids.length === 0) return [];
  const { users } = await getAdminAuth().getUsers(uids.map((uid) => ({ uid })));
  const nameByUid = new Map(
    users.map((u) => [u.uid, u.displayName ?? u.email ?? u.uid]),
  );
  return uids.map((uid) => ({ uid, name: nameByUid.get(uid) ?? uid }));
}
