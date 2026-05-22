import type { Group } from "@/lib/types/group";

export interface FirebaseGroupPublic {
  name: string;
  createdAt: number;
  creatorId: string;
  inviteToken: string;
  adminIds?: Record<string, true>;
  picksRestricted?: boolean;
  emoji?: string;
}

export function groupToFirebase(
  group: Pick<
    Group,
    | "name"
    | "emoji"
    | "createdAt"
    | "creatorId"
    | "inviteToken"
    | "adminIds"
    | "picksRestricted"
  >,
): FirebaseGroupPublic {
  return {
    name: group.name,
    emoji: group.emoji,
    createdAt: group.createdAt.getTime(),
    creatorId: group.creatorId,
    inviteToken: group.inviteToken,
    adminIds: Object.fromEntries(group.adminIds.map((uid) => [uid, true])),
    picksRestricted: group.picksRestricted,
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
  const emoji =
    typeof data.emoji === "string" && data.emoji.trim()
      ? data.emoji.trim()
      : "👥";
  return {
    id,
    name: data.name,
    emoji,
    createdAt: new Date(data.createdAt),
    creatorId: data.creatorId,
    memberIds,
    adminIds,
    picksRestricted: data.picksRestricted ?? false,
    inviteToken: data.inviteToken,
  };
}
