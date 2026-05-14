export enum RankingTier {
  LoveIt = "love_it",
  Maybe = "maybe",
  NotReally = "not_really",
  Unranked = "unranked",
  Yes = "yes",
}

export const TIER_RANKING_COPY = {
  tiers: {
    [RankingTier.LoveIt]: "Love it",
    [RankingTier.Maybe]: "Maybe",
    [RankingTier.NotReally]: "Not really",
    [RankingTier.Unranked]: "Unranked",
    [RankingTier.Yes]: "Yes",
  },
} as const;
