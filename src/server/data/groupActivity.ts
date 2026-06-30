import { getDatabase } from "firebase-admin/database";

import {
  computeUnreadCount,
  deriveActivityPreview,
} from "@/lib/deriveGroupActivity";
import { getAdminApp } from "@/lib/firebase/admin";
import type { GroupPick } from "@/lib/types/pick";

import { getCategoriesByGroupId } from "./categories";
import { getPicksByCategory } from "./picks";

export async function getPicksForGroup(groupId: string): Promise<GroupPick[]> {
  const categories = await getCategoriesByGroupId(groupId);
  const pickArrays = await Promise.all(
    categories.map((c) => getPicksByCategory(c.id)),
  );
  return pickArrays.flat();
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
