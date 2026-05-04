export interface GroupInvite {
  token: string;
  groupId: string;
  createdAt: Date;
  expiresAt: Date | undefined;
  active: boolean;
}
