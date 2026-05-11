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
  options?: PickOption[];
}
