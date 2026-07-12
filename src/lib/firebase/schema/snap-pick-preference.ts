// Snap Pick preference schema boundary.
//
// A user's global preference model for one Snap Pick is stored at
//   snap-pick-preferences/{snapPickId}/{userId}
// as a flat map of optionId -> { rating, games } (see snap-pick-inference). This
// is the O(N) rating vector — one entry per option the user has voted on — not
// the O(N²) pairwise matrix. Domain and persisted shapes both use plain numbers,
// so the converters are near-identity, but reads still parse so a malformed node
// fails loudly instead of poisoning the model.

import { z } from "zod";

import type { SnapPickRating, SnapPickRatings } from "@/lib/types/snap-pick";

export interface FirebaseSnapPickRating {
  rating: number;
  games: number;
}

export type FirebaseSnapPickPreferences = Record<
  string,
  FirebaseSnapPickRating
>;

const FirebaseSnapPickRatingSchema = z.object({
  rating: z.number(),
  games: z.number(),
});

const FirebaseSnapPickPreferencesSchema = z.record(
  z.string(),
  FirebaseSnapPickRatingSchema,
);

export function snapPickRatingToFirebase(
  rating: SnapPickRating,
): FirebaseSnapPickRating {
  return { rating: rating.rating, games: rating.games };
}

export function firebaseToSnapPickRating(data: unknown): SnapPickRating {
  return FirebaseSnapPickRatingSchema.parse(data);
}

export function firebaseToSnapPickPreferences(data: unknown): SnapPickRatings {
  return FirebaseSnapPickPreferencesSchema.parse(data);
}
