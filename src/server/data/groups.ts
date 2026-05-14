import { getDatabase } from "firebase-admin/database";

import { getAdminApp, getAdminAuth } from "@/lib/firebase/admin";
import {
  type FirebaseGroupPublic,
  firebaseToGroup,
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

export async function removeMember(
  groupId: string,
  uid: string,
): Promise<{ lastMember: boolean }> {
  const db = getDatabase(getAdminApp());
  // Atomically check-and-remove the calling member: if they are the last
  // member, abort the transaction (returning undefined leaves the data
  // untouched and result.committed === false). Otherwise, write back the
  // members object with the calling uid removed in a single atomic step.
  // Concurrency-safety matters here: without the transaction, two concurrent
  // calls in a two-member group can both pass the last-member guard and
  // both delete their own uid, leaving the group with an empty members map.
  const result = await db
    .ref(`groups/${groupId}/members`)
    .transaction((members: Record<string, unknown> | null) => {
      if (!members) return members;
      if (Object.keys(members).length <= 1) return undefined;
      return Object.fromEntries(
        Object.entries(members).filter(([key]) => key !== uid),
      );
    });
  if (!result.committed) return { lastMember: true };
  // Best-effort follow-up: clean up the user-index entry. The transaction
  // already removed the user from the group (which is the user-facing
  // change), so a failure here would leave a dangling user-index entry but
  // would not affect group membership.
  await db.ref("/").update({
    [`users/${uid}/groups/${groupId}`]: null,
  });
  return { lastMember: false };
}
