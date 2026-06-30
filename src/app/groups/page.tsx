import { redirect } from "next/navigation";

import type { GroupWithActivity } from "@/lib/types/groupActivity";
import { deriveGroupActivity } from "@/server/data/groupActivity";
import { getGroupsByUserId } from "@/server/data/groups";
import { getVerifiedUid } from "@/server/utils/auth";

import { GroupListView } from "./GroupListView";

export default async function GroupListPage() {
  const uid = await getVerifiedUid();
  if (!uid) redirect("/sign-in");

  const groups = await getGroupsByUserId(uid);

  const groupsWithActivity: GroupWithActivity[] = await Promise.all(
    groups.map(async (group) => {
      const { activityPreview, unreadCount } = await deriveGroupActivity(
        group.id,
        uid,
      );
      return { ...group, activityPreview, unreadCount };
    }),
  );

  return <GroupListView groups={groupsWithActivity} />;
}
