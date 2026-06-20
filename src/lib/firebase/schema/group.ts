import { z } from "zod";

import type { Group } from "@/lib/types/group";

export interface FirebaseGroupPublic {
  name: string;
  createdAt: number;
  creatorId: string;
  inviteToken: string;
  adminIds?: Record<string, true>;
  picksRestricted?: boolean;
}

// Runtime shape of a persisted group's public node. Parsed on read so a
// malformed document fails loudly instead of producing silent undefined bugs.
const FirebaseGroupPublicSchema = z.object({
  name: z.string(),
  createdAt: z.number(),
  creatorId: z.string(),
  inviteToken: z.string(),
  adminIds: z.record(z.string(), z.literal(true)).optional(),
  picksRestricted: z.boolean().optional(),
});

export function groupToFirebase(
  group: Pick<
    Group,
    | "name"
    | "createdAt"
    | "creatorId"
    | "inviteToken"
    | "adminIds"
    | "picksRestricted"
  >,
): FirebaseGroupPublic {
  return {
    name: group.name,
    createdAt: group.createdAt.getTime(),
    creatorId: group.creatorId,
    inviteToken: group.inviteToken,
    adminIds: Object.fromEntries(group.adminIds.map((uid) => [uid, true])),
    picksRestricted: group.picksRestricted,
  };
}

export function firebaseToGroup(
  id: string,
  data: unknown,
  memberIds: string[],
): Group {
  const parsed = FirebaseGroupPublicSchema.parse(data);
  const adminIds = parsed.adminIds
    ? Object.keys(parsed.adminIds)
    : [parsed.creatorId];
  return {
    id,
    name: parsed.name,
    createdAt: new Date(parsed.createdAt),
    creatorId: parsed.creatorId,
    memberIds,
    adminIds,
    picksRestricted: parsed.picksRestricted ?? false,
    inviteToken: parsed.inviteToken,
  };
}
