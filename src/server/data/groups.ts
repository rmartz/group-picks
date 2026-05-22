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

  const [membershipSnap, seenCountsSnap] = await Promise.all([
    db.ref(`users/${uid}/groups`).get(),
    db.ref(`users/${uid}/groupSeenActivityCounts`).get(),
  ]);
  if (!membershipSnap.exists()) return [];

  const groupIds = Object.keys(membershipSnap.val() as Record<string, unknown>);
  const seenCounts = seenCountsSnap.exists()
    ? (seenCountsSnap.val() as Record<string, number>)
    : {};

  const groups = await Promise.all(groupIds.map((id) => getGroupById(id)));
  return groups
    .filter((g): g is Group => g !== undefined)
    .map((group) => {
      const seenCount = seenCounts[group.id] ?? 0;
      return {
        ...group,
        unreadCount: Math.max((group.activityCount ?? 0) - seenCount, 0),
      };
    });
}

interface GroupActivityPayload {
  summary: string;
  at?: Date;
}

export async function recordGroupActivity(
  groupId: string,
  payload: GroupActivityPayload,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  const eventTimestamp = payload.at?.getTime() ?? Date.now();
  const publicRef = db.ref(`groups/${groupId}/public`);

  await publicRef.transaction((current: FirebaseGroupPublic | null) => {
    if (current === null) return current;
    return {
      ...current,
      lastActivity: payload.summary,
      lastActivityAt: eventTimestamp,
      activityCount: (current.activityCount ?? 0) + 1,
    };
  });
}

export async function markGroupActivitySeen(
  groupId: string,
  uid: string,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  const activityCountSnap = await db
    .ref(`groups/${groupId}/public/activityCount`)
    .get();
  const activityCount = activityCountSnap.exists()
    ? (activityCountSnap.val() as number)
    : 0;
  await db
    .ref(`users/${uid}/groupSeenActivityCounts/${groupId}`)
    .set(activityCount);
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

export async function updatePicksRestricted(
  groupId: string,
  picksRestricted: boolean,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  await db.ref(`groups/${groupId}/public/picksRestricted`).set(picksRestricted);
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
      if (!members) return undefined;
      if (!(uid in members)) return members;
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
    [`users/${uid}/groupSeenActivityCounts/${groupId}`]: null,
  });
  return { lastMember: false };
}

export async function removeGroupMember(
  groupId: string,
  uid: string,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  await db.ref("/").update({
    [`groups/${groupId}/members/${uid}`]: null,
    [`groups/${groupId}/public/adminIds/${uid}`]: null,
    [`users/${uid}/groups/${groupId}`]: null,
    [`users/${uid}/groupSeenActivityCounts/${groupId}`]: null,
  });
}

export async function promoteAdmin(
  groupId: string,
  uid: string,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  await db.ref(`groups/${groupId}/public/adminIds/${uid}`).set(true);
}

export async function revokeAdmin(groupId: string, uid: string): Promise<void> {
  const db = getDatabase(getAdminApp());
  await db.ref(`groups/${groupId}/public/adminIds/${uid}`).remove();
}
