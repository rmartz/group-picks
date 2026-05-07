export enum PickStatus {
  Closed = "closed",
  Open = "open",
}

export interface GroupPick {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  closedAt?: Date;
  createdAt: Date;
  creatorId: string;
  status: PickStatus;
}
