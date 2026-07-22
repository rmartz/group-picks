import { getDatabase } from "firebase-admin/database";

import { getAdminApp } from "@/lib/firebase/admin";
import type { FirebaseSnapPickPreferences } from "@/lib/firebase/schema/snap-pick-preference";
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

// Applies one cast vote to the member's global preference model: an
// incremental Elo update touching only the two contested options — the rest of
// the pool is carried through untouched. Absent ratings start at the cold-start
// neutral.
//
// The read-modify-write runs inside a Realtime Database transaction on the
// user's whole rating node so it is atomic: without it, two concurrent votes on
// different matchups (e.g. two browser tabs) can both read the same node, each
// apply its own delta, and the last write clobber the other's — silently
// dropping an Elo update. The transaction re-runs its body against the latest
// value on contention, so no delta is lost. Called on the vote path alongside
// recording the vote itself.
export async function updateSnapPickPreference(
  snapPickId: string,
  userId: string,
  winnerId: string,
  loserId: string,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  const base = db.ref(`snap-pick-preferences/${snapPickId}/${userId}`);

  await base.transaction((current: FirebaseSnapPickPreferences | null) => {
    const ratings: SnapPickRatings = {};
    const winnerRaw = current?.[winnerId];
    const loserRaw = current?.[loserId];
    if (winnerRaw !== undefined) {
      ratings[winnerId] = firebaseToSnapPickRating(winnerRaw);
    }
    if (loserRaw !== undefined) {
      ratings[loserId] = firebaseToSnapPickRating(loserRaw);
    }

    const updated = applyVote(ratings, winnerId, loserId);
    return {
      ...current,
      [winnerId]: snapPickRatingToFirebase(getRating(updated, winnerId)),
      [loserId]: snapPickRatingToFirebase(getRating(updated, loserId)),
    };
  });
}
