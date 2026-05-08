export interface GroupPick {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  closedAt?: Date;
  closedManually?: boolean;
  createdAt: Date;
  creatorId: string;
}
