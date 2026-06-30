import { makeGroup } from "@/lib/fixtures/group";
import type { Group } from "@/lib/types/group";
import type { GroupWithActivity } from "@/lib/types/groupActivity";

export function makeGroupWithActivity(
  groupOverrides?: Partial<Group>,
  activityOverrides?: Partial<
    Pick<GroupWithActivity, "activityPreview" | "unreadCount">
  >,
): GroupWithActivity {
  return {
    ...makeGroup(groupOverrides),
    unreadCount: 0,
    ...activityOverrides,
  };
}
