import { RankingTier } from "@/lib/types/ranking";

export { RankingTier };

export const TIER_ORDER = [
  RankingTier.LoveIt,
  RankingTier.Yes,
  RankingTier.Maybe,
  RankingTier.NotForMe,
  RankingTier.Unranked,
] as const;

export const TIER_RANKING_COPY = {
  tiers: {
    [RankingTier.LoveIt]: "Love it",
    [RankingTier.Maybe]: "Maybe",
    [RankingTier.NotForMe]: "Not for me",
    [RankingTier.Unranked]: "Unranked",
    [RankingTier.Yes]: "Yes",
  },
} as const;
