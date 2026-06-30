export interface PriorPickBannerData {
  overlappingCount: number;
  pickTitle: string;
  prefillAssignments: Record<string, RankingTier>;
  rankedAt: Date;
}

export enum RankingTier {
  LoveIt = "love_it",
  Maybe = "maybe",
  NotForMe = "not_for_me",
  Unranked = "unranked",
  Yes = "yes",
}
