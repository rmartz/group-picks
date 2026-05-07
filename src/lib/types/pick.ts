export enum PickStatus {
  Closed = "closed",
  Open = "open",
}

export interface GroupPick {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  status: PickStatus;
  dueDate?: Date;
  createdAt: Date;
  creatorId: string;
}
