import { getDatabase } from "firebase-admin/database";
import { getAdminApp } from "@/lib/firebase/admin";
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

export async function getGroupsByUserId(uid: string): Promise<Group[]> {
  const db = getDatabase(getAdminApp());

  const membershipSnap = await db.ref(`users/${uid}/groups`).get();
  if (!membershipSnap.exists()) return [];

  const groupIds = Object.keys(membershipSnap.val() as Record<string, unknown>);

  const groups = await Promise.all(groupIds.map((id) => getGroupById(id)));
  return groups.filter((g): g is Group => g !== undefined);
}
