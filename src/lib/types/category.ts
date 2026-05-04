export interface Category {
  id: string;
  groupId: string;
  name: string;
  description: string | undefined;
  createdAt: Date;
  creatorId: string;
}
