import type { Group } from "@/lib/types/group";

export interface FirebaseGroupPublic {
  name: string;
  createdAt: number;
  creatorId: string;
}

export function groupToFirebase(
  group: Pick<Group, "name" | "createdAt" | "creatorId">,
): FirebaseGroupPublic {
  return {
    name: group.name,
    createdAt: group.createdAt.getTime(),
    creatorId: group.creatorId,
  };
}

export function firebaseToGroup(
  id: string,
  data: FirebaseGroupPublic,
  memberIds: string[],
): Group {
  return {
    id,
    name: data.name,
    createdAt: new Date(data.createdAt),
    creatorId: data.creatorId,
    memberIds,
  };
}
