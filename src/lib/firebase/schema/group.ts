import type { Group } from "@/lib/types/group";

export interface FirebaseGroupPublic {
  name: string;
  createdAt: number;
  creatorId: string;
  inviteToken: string;
  adminIds?: Record<string, true>;
  picksRestricted?: boolean;
  lastActivity?: string;
  lastActivityAt?: number;
  activityCount?: number;
}

export function groupToFirebase(
  group: Pick<
    Group,
    | "name"
    | "createdAt"
    | "creatorId"
    | "inviteToken"
    | "adminIds"
    | "picksRestricted"
    | "lastActivity"
    | "lastActivityAt"
    | "activityCount"
  >,
): FirebaseGroupPublic {
  return {
    name: group.name,
    createdAt: group.createdAt.getTime(),
    creatorId: group.creatorId,
    inviteToken: group.inviteToken,
    adminIds: Object.fromEntries(group.adminIds.map((uid) => [uid, true])),
    picksRestricted: group.picksRestricted,
    lastActivity: group.lastActivity,
    lastActivityAt: group.lastActivityAt?.getTime(),
    activityCount: group.activityCount,
  };
}

export function firebaseToGroup(
  id: string,
  data: FirebaseGroupPublic,
  memberIds: string[],
): Group {
  const adminIds = data.adminIds
    ? Object.keys(data.adminIds)
    : [data.creatorId];
  return {
    id,
    name: data.name,
    createdAt: new Date(data.createdAt),
    creatorId: data.creatorId,
    memberIds,
    adminIds,
    picksRestricted: data.picksRestricted ?? false,
    inviteToken: data.inviteToken,
    lastActivity: data.lastActivity,
    lastActivityAt:
      typeof data.lastActivityAt === "number"
        ? new Date(data.lastActivityAt)
        : undefined,
    activityCount:
      typeof data.activityCount === "number" ? data.activityCount : 0,
  };
}
