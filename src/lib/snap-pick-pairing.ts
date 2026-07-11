// Pure head-to-head pairing logic for Snap Picks: deriving the deterministic key
// that identifies an unordered option pair, enumerating the full round-robin set
// of matchups for an option pool, and computing the queue of matchups a given
// member still needs to vote on. Kept free of Firebase and React so it can be
// unit-tested in isolation and shared by the API route and the voting UI.
//
// The base seeding is intentionally simple: options are compared in pool order
// (round-robin), which surfaces every pair exactly once. The #260 preference
// engine layers on top via relevantMatchups, which focuses the pool on the
// contested set (pruning clearly-low-relevance options) before pairing.

import { focusRelevantOptions } from "@/lib/snap-pick-inference";
import type { SnapPickRatings } from "@/lib/types/snap-pick";

// An unordered pairing of two options. `a` is always the option that sorts first
// so a pair has one canonical representation regardless of presentation order.
export interface SnapPickPair {
  a: string;
  b: string;
}

// Deterministic key for an unordered option pair: the two ids sorted and joined,
// so `${optionA}_${optionB}` is identical no matter which side each option was
// shown on. This keys a member's cast votes for dedup and mid-activation resume.
export function pairKey(optionA: string, optionB: string): string {
  return [optionA, optionB].sort().join("_");
}

// Every distinct unordered pair of options, in round-robin order (each earlier
// option paired with every later option). A pool of n options yields n*(n-1)/2
// matchups. Order is deterministic given the input order.
export function allMatchups(optionIds: string[]): SnapPickPair[] {
  const matchups: SnapPickPair[] = [];
  optionIds.forEach((first, i) => {
    for (const second of optionIds.slice(i + 1)) {
      matchups.push(
        first < second ? { a: first, b: second } : { a: second, b: first },
      );
    }
  });
  return matchups;
}

// The matchups a member has not yet voted on, preserving round-robin order.
// `castPairKeys` are the keys of pairs the member has already decided (from their
// prior votes in this activation), so a member who joins mid-activation — or
// resumes after voting on some pairs — sees only their own remaining queue rather
// than the full set from the start.
export function remainingMatchups(
  optionIds: string[],
  castPairKeys: Iterable<string>,
): SnapPickPair[] {
  const cast = new Set(castPairKeys);
  return allMatchups(optionIds).filter(
    (pair) => !cast.has(pairKey(pair.a, pair.b)),
  );
}

// The member's remaining queue focused by their global preference model: the
// #260 relevance layer prunes clearly-low-relevance options and orders the rest
// most-relevant first, so matchups concentrate on the contested set rather than
// spending votes on options the member broadly doesn't care about. Cold-start
// options (no history) fall back to neutral and stay eligible. With an empty
// model every option is neutral, so this reduces to remainingMatchups.
export function relevantMatchups(
  optionIds: string[],
  ratings: SnapPickRatings,
  castPairKeys: Iterable<string>,
): SnapPickPair[] {
  return remainingMatchups(
    focusRelevantOptions(optionIds, ratings),
    castPairKeys,
  );
}
