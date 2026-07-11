// Global per-user preference inference for Snap Picks (v1: relevance).
//
// The model is an Elo / Bradley-Terry rating vector: one scalar strength per
// option per user per Snap Pick, learned from every vote the user has ever cast
// across activations. It is deliberately *global* — an average over all past
// runs — because that is exactly the right signal for **relevance**: an option a
// user dislikes in every context stays low, so it can be pruned from future
// matchups. It intentionally does not model intra-session mood (that is v2,
// #371) and does not choose the next question by information gain (v3, #375).
//
// This module is the narrow interface those later phases layer on: it exposes
// the raw rating *and* its uncertainty (games played, pairwise rating gap), not
// a single thresholded confidence, so v2/v3 can build on the model without
// touching it.

import type { SnapPickRating, SnapPickRatings } from "@/lib/types/snap-pick";

// The rating an option with no vote history starts at. A cold-start option sits
// exactly here with zero games, so it is neither pruned nor de-prioritised and
// stays fully eligible for matchups until real votes move it.
export const NEUTRAL_RATING = 1000;

// Elo sensitivity: how large a rating change one vote applies at even odds. At
// equal ratings a vote moves winner and loser by ELO_K / 2 each.
export const ELO_K = 32;

// Logistic scale of the Bradley-Terry model — a 400-point gap means the stronger
// option is expected to win ~10x as often (the classic Elo constant).
export const ELO_SCALE = 400;

// An option must have at least this many games before it can be pruned as
// low-relevance: below it the rating is too noisy to confidently discard.
export const PRUNE_MIN_GAMES = 3;

// How far below neutral a (sufficiently-played) option must fall to count as
// clearly-low relevance and be pruned from the matchup pool.
export const PRUNE_RATING_MARGIN = 40;

// The relevance of one option: its point strength plus the uncertainty around
// it (games played). Callers rank on `rating` and gate on `games`.
export interface OptionRelevance {
  optionId: string;
  rating: number;
  games: number;
}

// The uncertainty of a pairwise comparison, for v2/v3: the magnitude of the
// rating gap (how separated the two options are) and the smaller of the two
// games counts (how much evidence backs the weaker-observed side).
export interface PairUncertainty {
  ratingGap: number;
  games: number;
}

// The rating an option carries, defaulting to the cold-start neutral when the
// user has no history for it.
export function getRating(
  ratings: SnapPickRatings,
  optionId: string,
): SnapPickRating {
  return ratings[optionId] ?? { rating: NEUTRAL_RATING, games: 0 };
}

// Applies a single vote to the model and returns the two updated ratings — an
// O(1) incremental Elo update touching only the winner and loser, never the rest
// of the pool. The rating mass one option gains the other loses, so the update
// is conservative.
export function applyVote(
  ratings: SnapPickRatings,
  winnerId: string,
  loserId: string,
): SnapPickRatings {
  const winner = getRating(ratings, winnerId);
  const loser = getRating(ratings, loserId);
  const expectedWinner =
    1 / (1 + 10 ** ((loser.rating - winner.rating) / ELO_SCALE));
  const change = ELO_K * (1 - expectedWinner);
  return {
    [winnerId]: { rating: winner.rating + change, games: winner.games + 1 },
    [loserId]: { rating: loser.rating - change, games: loser.games + 1 },
  };
}

// The relevance of every option, ranked most- to least-relevant. Ties (including
// the all-cold-start case) keep the input order, so the ranking is deterministic.
export function rankByRelevance(
  optionIds: string[],
  ratings: SnapPickRatings,
): OptionRelevance[] {
  return optionIds
    .map((optionId) => {
      const { rating, games } = getRating(ratings, optionId);
      return { optionId, rating, games };
    })
    .sort((a, b) => b.rating - a.rating);
}

// Whether an option is confidently low-relevance: it has enough games to trust
// the signal and its rating has fallen clearly below neutral. Cold-start options
// (too few games) never qualify, so they are always kept.
export function isLowRelevance(rating: SnapPickRating): boolean {
  return (
    rating.games >= PRUNE_MIN_GAMES &&
    rating.rating < NEUTRAL_RATING - PRUNE_RATING_MARGIN
  );
}

// The option pool to actually run matchups over: clearly-low-relevance options
// pruned and the rest ordered most-relevant first, so matchups concentrate on
// the contested set. Cold-start options are never pruned. Pruning never drops
// the pool below two options (there would be no matchup left) — if it would, the
// full pool is kept, still relevance-ordered.
export function focusRelevantOptions(
  optionIds: string[],
  ratings: SnapPickRatings,
): string[] {
  const ranked = rankByRelevance(optionIds, ratings);
  const kept = ranked.filter((option) => !isLowRelevance(option));
  const focused = kept.length >= 2 ? kept : ranked;
  return focused.map((option) => option.optionId);
}

// The uncertainty of comparing two options — exposed for v2 (mood) and v3
// (information-gain question selection) to reason about which matchups are still
// worth asking, without re-deriving the model.
export function pairUncertainty(
  ratings: SnapPickRatings,
  optionA: string,
  optionB: string,
): PairUncertainty {
  const a = getRating(ratings, optionA);
  const b = getRating(ratings, optionB);
  return {
    ratingGap: Math.abs(a.rating - b.rating),
    games: Math.min(a.games, b.games),
  };
}
