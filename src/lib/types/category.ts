export interface Category {
  id: string;
  name: string;
  description?: string;
  groupId: string;
  createdAt: Date;
  creatorId: string;
  topPickCount?: number;
  rankedBallots?: string[][];
  rankedCount?: number;
  totalCount?: number;
  closesAt?: Date;
  closedAt?: Date;
}
