import { getDatabase } from "firebase-admin/database";

import { getAdminApp } from "@/lib/firebase/admin";
import {
  firebaseToSnapPickPreferences,
  firebaseToSnapPickRating,
  snapPickRatingToFirebase,
} from "@/lib/firebase/schema/snap-pick-preference";
import { applyVote, getRating } from "@/lib/snap-pick-inference";
import type { SnapPickRatings } from "@/lib/types/snap-pick";

// A user's whole global preference model for a Snap Pick — the O(N) rating
// vector read on the vote-screen path so the pairing can focus the matchup pool.
// An untouched model (no votes yet) reads as an empty map, which the relevance
// layer treats as all cold-start (neutral).
export async function getSnapPickPreferences(
  snapPickId: string,
  userId: string,
): Promise<SnapPickRatings> {
  const db = getDatabase(getAdminApp());
  const snap = await db
    .ref(`snap-pick-preferences/${snapPickId}/${userId}`)
    .get();

  if (!snap.exists()) return {};

  return firebaseToSnapPickPreferences(snap.val());
}

// Applies one cast vote to the member's global preference model: an O(1)
// incremental Elo update that reads only the two options' current ratings and
// writes only those two back — the rest of the pool is never touched. Absent
// ratings start at the cold-start neutral. Called on the vote path alongside
// recording the vote itself.
export async function updateSnapPickPreference(
  snapPickId: string,
  userId: string,
  winnerId: string,
  loserId: string,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  const base = db.ref(`snap-pick-preferences/${snapPickId}/${userId}`);

  const [winnerSnap, loserSnap] = await Promise.all([
    base.child(winnerId).get(),
    base.child(loserId).get(),
  ]);

  const current: SnapPickRatings = {};
  if (winnerSnap.exists()) {
    current[winnerId] = firebaseToSnapPickRating(winnerSnap.val());
  }
  if (loserSnap.exists()) {
    current[loserId] = firebaseToSnapPickRating(loserSnap.val());
  }

  const updated = applyVote(current, winnerId, loserId);
  await base.update({
    [winnerId]: snapPickRatingToFirebase(getRating(updated, winnerId)),
    [loserId]: snapPickRatingToFirebase(getRating(updated, loserId)),
  });
}
