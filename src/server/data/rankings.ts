import { getDatabase } from "firebase-admin/database";

import { getAdminApp } from "@/lib/firebase/admin";
import { RankingTier } from "@/lib/types/ranking";

const VALID_RANKING_TIERS = new Set<string>(Object.values(RankingTier));

function isRankingRecord(val: unknown): val is Record<string, RankingTier> {
  if (typeof val !== "object" || val === null) return false;
  return Object.values(val as Record<string, unknown>).every((v) =>
    VALID_RANKING_TIERS.has(v as string),
  );
}

export async function getAllRankingsForPick(
  pickId: string,
): Promise<Record<string, Record<string, RankingTier>>> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`rankings/${pickId}`).get();

  if (!snap.exists()) return {};

  const data = snap.val() as Record<string, unknown>;
  const result: Record<string, Record<string, RankingTier>> = {};

  for (const [userId, userRankings] of Object.entries(data)) {
    if (isRankingRecord(userRankings)) {
      result[userId] = userRankings;
    }
  }

  return result;
}

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
