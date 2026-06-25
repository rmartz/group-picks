export enum RankingMode {
  HeadToHead = "head-to-head",
  StackRank = "stack-rank",
  TierBuckets = "tier-buckets",
}

export interface PickOption {
  id: string;
  ownerIds: string[];
  title: string;
}

export interface GroupPick {
  id: string;
  title: string;
  description?: string;
  topCount: number;
  dueDate?: Date;
  categoryId: string;
  closedAt?: Date;
  closedManually?: boolean;
  createdAt: Date;
  creatorId: string;
  rankingMode: RankingMode;
  options?: PickOption[];
  resultsVisible?: boolean;
}
