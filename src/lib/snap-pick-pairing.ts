// Pure head-to-head pairing logic for Snap Picks: deriving the deterministic key
// that identifies an unordered option pair, enumerating the full round-robin set
// of matchups for an option pool, and computing the queue of matchups a given
// member still needs to vote on. Kept free of Firebase and React so it can be
// unit-tested in isolation and shared by the API route and the voting UI.
//
// The seeding is intentionally simple for #259: options are compared in pool
// order (round-robin), which surfaces every pair exactly once. The preference
// inference engine (#260) will later reorder this queue to prioritise the most
// informative matchups; this module exposes the queue it will refine.

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
