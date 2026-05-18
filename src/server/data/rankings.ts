import { getDatabase } from "firebase-admin/database";

import { getAdminApp } from "@/lib/firebase/admin";
import type { RankingTier } from "@/lib/types/ranking";

export async function getRankingByUser(
  pickId: string,
  userId: string,
): Promise<Record<string, RankingTier>> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`rankings/${pickId}/${userId}`).get();
  if (!snap.exists()) return {};
  return snap.val() as Record<string, RankingTier>;
}

export async function saveRanking(
  pickId: string,
  userId: string,
  assignments: Record<string, RankingTier>,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  await db.ref(`rankings/${pickId}/${userId}`).set(assignments);
}
