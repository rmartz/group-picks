import { RankingTier } from "@/lib/types/ranking";

export { RankingTier };

export const TIER_ORDER = [
  RankingTier.LoveIt,
  RankingTier.Yes,
  RankingTier.Maybe,
  RankingTier.NotReally,
  RankingTier.Unranked,
] as const;

export const TIER_RANKING_COPY = {
  tiers: {
    [RankingTier.LoveIt]: "Love it",
    [RankingTier.Maybe]: "Maybe",
    [RankingTier.NotReally]: "Not really",
    [RankingTier.Unranked]: "Unranked",
    [RankingTier.Yes]: "Yes",
  },
} as const;
