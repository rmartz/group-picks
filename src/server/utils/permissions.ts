import type { Group } from "@/lib/types/group";

/** True if uid is a promoted admin of the group. */
export function isGroupAdmin(uid: string, group: Group): boolean {
  return group.adminIds.includes(uid);
}

/** True if uid may edit or delete a resource (creator or any group admin). */
export function canModifyResource(
  uid: string,
  resourceCreatorId: string,
  group: Group,
): boolean {
  return uid === resourceCreatorId || isGroupAdmin(uid, group);
}

/**
 * Variant for Options, which use shared ownership (ownerIds[]) rather than
 * a single creatorId. Any owner or any group admin may modify.
 */
export function canModifyOption(
  uid: string,
  ownerIds: string[],
  group: Group,
): boolean {
  return ownerIds.includes(uid) || isGroupAdmin(uid, group);
}
