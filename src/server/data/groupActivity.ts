import { getDatabase } from "firebase-admin/database";

import {
  computeUnreadCount,
  deriveActivityPreview,
} from "@/lib/deriveGroupActivity";
import { getAdminApp } from "@/lib/firebase/admin";
import { firebaseToPick } from "@/lib/firebase/schema/pick";
import type { GroupPick } from "@/lib/types/pick";

export async function getPicksForGroup(groupId: string): Promise<GroupPick[]> {
  // The indexed group query returns each matching `categories/{id}` node in
  // full — including its nested `picks` — so every pick is derived from this
  // single round-trip. Re-reading picks per category (the prior N+1) is
  // redundant: the picks are already present in this snapshot.
  const db = getDatabase(getAdminApp());
  const snap = await db
    .ref("categories")
    .orderByChild("public/groupId")
    .equalTo(groupId)
    .get();

  if (!snap.exists()) return [];

  const picks: GroupPick[] = [];
  snap.forEach((categorySnap) => {
    categorySnap.child("picks").forEach((pickSnap) => {
      const pickId = pickSnap.key;
      if (pickId) picks.push(firebaseToPick(pickId, pickSnap.val()));
    });
  });

  return picks;
}

export async function getLastSeenAt(
  uid: string,
  groupId: string,
): Promise<Date | undefined> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`users/${uid}/groupLastSeenAt/${groupId}`).get();
  if (!snap.exists()) return undefined;
  const val: unknown = snap.val();
  if (typeof val !== "number" || !Number.isFinite(val)) return undefined;
  return new Date(val);
}

export async function markGroupSeen(
  uid: string,
  groupId: string,
  seenAt: Date = new Date(),
): Promise<void> {
  const db = getDatabase(getAdminApp());
  await db.ref(`users/${uid}/groupLastSeenAt/${groupId}`).set(seenAt.getTime());
}

export async function deriveGroupActivity(
  groupId: string,
  uid: string,
): Promise<{ activityPreview: string | undefined; unreadCount: number }> {
  const [picks, lastSeenAt] = await Promise.all([
    getPicksForGroup(groupId),
    getLastSeenAt(uid, groupId),
  ]);

  return {
    activityPreview: deriveActivityPreview(picks),
    unreadCount: computeUnreadCount(picks, lastSeenAt),
  };
}
