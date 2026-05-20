export interface Group {
  id: string;
  name: string;
  emoji: string;
  createdAt: Date;
  creatorId: string;
  memberIds: string[];
  adminIds: string[];
  picksRestricted: boolean;
  inviteToken: string;
}
