import { getDatabase } from "firebase-admin/database";

import { getAdminApp } from "@/lib/firebase/admin";
import { firebaseToPick } from "@/lib/firebase/schema/pick";
import type { GroupPick } from "@/lib/types/pick";

import { getCategoriesByGroupId } from "./categories";

// Reads only a category's open picks (those with no `closedAt`) rather than the
// full picks node. Requires a Firebase Realtime Database index on "closedAt" at
// the "categories/$categoryId/picks" path. Add to database rules:
//   "categories": { "$categoryId": { "picks": { ".indexOn": ["closedAt"] } } }
async function getOpenPicksByCategory(
  categoryId: string,
): Promise<GroupPick[]> {
  const db = getDatabase(getAdminApp());
  const snap = await db
    .ref(`categories/${categoryId}/picks`)
    .orderByChild("closedAt")
    .equalTo(null)
    .get();

  if (!snap.exists()) return [];

  const picks: GroupPick[] = [];
  snap.forEach((child) => {
    const id = child.key;
    if (id) picks.push(firebaseToPick(id, child.val()));
  });

  return picks;
}

// Resolves the group's most recently created open pick across all categories.
// Only open picks are fetched per category, so the read cost scales with the
// number of open picks rather than the group's full pick history.
export async function getMostRecentOpenPick(
  groupId: string,
): Promise<GroupPick | undefined> {
  const categories = await getCategoriesByGroupId(groupId);
  const pickArrays = await Promise.all(
    categories.map((c) => getOpenPicksByCategory(c.id)),
  );

  return pickArrays
    .flat()
    .filter((p) => p.closedAt === undefined)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
}
