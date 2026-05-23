import type { ClosedPickResultEntry } from "@/lib/computePickResults";
import type { Option } from "@/lib/types/option";
import { RankingTier } from "@/lib/types/ranking";

const TIER_SCORES: Record<RankingTier, number> = {
  [RankingTier.LoveIt]: 4,
  [RankingTier.Yes]: 3,
  [RankingTier.Maybe]: 2,
  [RankingTier.NotReally]: 1,
  [RankingTier.Unranked]: 0,
};

function computeOptionScores(
  allRankings: Record<string, Record<string, RankingTier>>,
): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const userRankings of Object.values(allRankings)) {
    for (const [optionId, tier] of Object.entries(userRankings)) {
      scores[optionId] = (scores[optionId] ?? 0) + TIER_SCORES[tier];
    }
  }
  return scores;
}

export function computeTopPicks(
  allRankings: Record<string, Record<string, RankingTier>>,
  options: Option[],
  topCount: number,
): Option[] {
  const scores = computeOptionScores(allRankings);
  return [...options]
    .sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))
    .slice(0, topCount);
}

/**
 * Computes fully-ranked pick results using fixed-weight tier scoring.
 * Each option's score is the sum of its per-voter tier weights (see TIER_SCORES).
 * Ties share the same rank; ranks after a tie skip accordingly.
 * Top picks include all options with rank <= topCount (ties at the boundary expand the list).
 */
export function computeRankedResults(
  allRankings: Record<string, Record<string, RankingTier>>,
  options: Option[],
  topCount: number,
): { topPicks: ClosedPickResultEntry[]; runnersUp: ClosedPickResultEntry[] } {
  if (options.length === 0) {
    return { topPicks: [], runnersUp: [] };
  }

  const scores = computeOptionScores(allRankings);

  const sorted = [...options].sort(
    (a, b) =>
      (scores[b.id] ?? 0) - (scores[a.id] ?? 0) ||
      a.title.localeCompare(b.title),
  );

  const ranked: ClosedPickResultEntry[] = [];
  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    const prevItem = sorted[i - 1];
    if (!item) continue;
    if (
      i > 0 &&
      prevItem &&
      (scores[item.id] ?? 0) < (scores[prevItem.id] ?? 0)
    ) {
      currentRank = i + 1;
    }
    ranked.push({
      option: item,
      score: scores[item.id] ?? 0,
      rank: currentRank,
    });
  }

  const topPicks = ranked.filter((e) => e.rank <= topCount);
  const runnersUp = ranked.filter((e) => e.rank > topCount);

  return { topPicks, runnersUp };
}
