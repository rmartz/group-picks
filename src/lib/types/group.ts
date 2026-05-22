export interface Group {
  id: string;
  name: string;
  createdAt: Date;
  creatorId: string;
  memberIds: string[];
  adminIds: string[];
  picksRestricted: boolean;
  inviteToken: string;
  lastActivity?: string;
  lastActivityAt?: Date;
  activityCount?: number;
  unreadCount?: number;
}
