export interface GroupPick {
  id: string;
  title: string;
  description?: string;
  dueAt?: Date;
  topCount: number;
  categoryId: string;
  createdAt: Date;
  creatorId: string;
}
