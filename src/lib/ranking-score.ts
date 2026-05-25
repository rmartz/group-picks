import type { Option } from "@/lib/types/option";
import { RankingTier } from "@/lib/types/ranking";

const TIER_SCORES: Record<RankingTier, number> = {
  [RankingTier.LoveIt]: 4,
  [RankingTier.Yes]: 3,
  [RankingTier.Maybe]: 2,
  [RankingTier.NotForMe]: 1,
  [RankingTier.Unranked]: 0,
};

export function computeTopPicks(
  allRankings: Record<string, Record<string, RankingTier>>,
  options: Option[],
  topCount: number,
): Option[] {
  const scores: Record<string, number> = {};

  for (const userRankings of Object.values(allRankings)) {
    for (const [optionId, tier] of Object.entries(userRankings)) {
      scores[optionId] = (scores[optionId] ?? 0) + TIER_SCORES[tier];
    }
  }

  return [...options]
    .sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))
    .slice(0, topCount);
}
