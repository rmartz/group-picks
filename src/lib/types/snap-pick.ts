export interface SnapPick {
  id: string;
  title: string;
  categoryId: string;
  createdAt: Date;
  creatorId: string;
  defaultDurationMs: number;
}

export interface SnapPickOption {
  id: string;
  title: string;
  addedBy: string;
  addedAt: Date;
  removedAt?: Date;
}

export interface SnapPickActivation {
  id: string;
  snapPickId: string;
  startedAt: Date;
  closesAt: Date;
  closedAt?: Date;
  winnerId?: string;
  startedBy: string;
}
