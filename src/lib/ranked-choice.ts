// An ordered list of candidate IDs, from most to least preferred.
export type Ballot = readonly string[];

// Ordered ranking result: each group contains equally-ranked candidates.
// Index 0 = highest-ranked (winner tier), last index = lowest-ranked.
export type RankedResult = readonly (readonly string[])[];

// Runs a single instant-runoff election among the given candidates.
// Returns the winner(s) as an unsorted array; multiple candidates are returned only when all are tied.
function runSingleElection(
  ballots: readonly string[][],
  candidates: ReadonlySet<string>,
): readonly string[] {
  const remaining = new Set(candidates);
  let currentBallots = [...ballots];

  while (remaining.size > 0) {
    const counts = new Map<string, number>();
    for (const c of remaining) counts.set(c, 0);
    for (const ballot of currentBallots) {
      const top = ballot.find((c) => remaining.has(c));
      if (top !== undefined) counts.set(top, (counts.get(top) ?? 0) + 1);
    }

    const votes = [...counts.values()];
    const total = votes.reduce((a, b) => a + b, 0);
    const majority = total / 2;

    const majorityWinners = [...counts.entries()]
      .filter(([, v]) => v > majority)
      .map(([c]) => c);
    if (majorityWinners.length > 0) return majorityWinners;

    const min = Math.min(...votes);
    const max = Math.max(...votes);
    if (min === max) return [...remaining];

    const eliminated = new Set(
      [...counts.entries()].filter(([, v]) => v === min).map(([c]) => c),
    );
    for (const c of eliminated) remaining.delete(c);
    currentBallots = currentBallots.map((b) =>
      b.filter((c) => !eliminated.has(c)),
    );
  }
}

// Runs iterative ranked-choice voting on the given ballots and returns an ordered
// ranking of all candidates. Each inner array contains candidates tied at that rank,
// sorted alphabetically. Pass `allCandidates` to include candidates that may not
// appear on any ballot.
export function runRankedChoice(
  ballots: readonly Ballot[],
  allCandidates?: readonly string[],
): RankedResult {
  const candidates = new Set([...(allCandidates ?? []), ...ballots.flat()]);
  if (candidates.size === 0) return [];

  const result: string[][] = [];
  const remaining = new Set(candidates);
  let currentBallots = ballots.map((b) => [...b]);

  while (remaining.size > 0) {
    const tier = [...runSingleElection(currentBallots, remaining)].sort();
    result.push(tier);
    const tierSet = new Set(tier);
    for (const c of tier) remaining.delete(c);
    currentBallots = currentBallots.map((b) =>
      b.filter((c) => !tierSet.has(c)),
    );
  }

  return result;
}
