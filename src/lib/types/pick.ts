export interface GroupPick {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  createdAt: Date;
  creatorId: string;
  dueDate?: Date;
  closedAt?: Date;
}
