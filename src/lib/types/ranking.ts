export interface PriorPickBannerData {
  overlappingCount: number;
  pickTitle: string;
  prefillAssignments: Record<string, RankingTier>;
  rankedAt: Date;
}

export const RankingTier = {
  LoveIt: "love_it",
  Maybe: "maybe",
  NotForMe: "not_for_me",
  Unranked: "unranked",
  Yes: "yes",
} as const;

export type RankingTier = (typeof RankingTier)[keyof typeof RankingTier];
