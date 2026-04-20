export interface Group {
  id: string;
  name: string;
  createdAt: Date;
  creatorId: string;
  memberIds: string[];
}
