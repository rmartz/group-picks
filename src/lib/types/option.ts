export interface PickOption {
  id: string;
  name: string;
  creatorId: string;
  owners: string[];
  createdAt: Date;
  pickId: string;
  categoryId: string;
  interestedCount: number;
}

export interface UserPickInterests {
  pickId: string;
  categoryId: string;
  interestedOptionIds: string[];
}
