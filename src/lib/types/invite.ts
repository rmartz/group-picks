export enum InviteMode {
  Group = "group",
  Personal = "personal",
}

export interface GroupInvite {
  token: string;
  groupId: string;
  createdAt: Date;
  expiresAt: Date | undefined;
  active: boolean;
  mode: InviteMode;
  createdBy?: string;
}
