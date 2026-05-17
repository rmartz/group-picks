import { redirect } from "next/navigation";

import { getGroupsByUserId } from "@/server/data/groups";
import { getVerifiedUid } from "@/server/utils/auth";

import { GroupListView } from "./GroupListView";

export default async function GroupListPage() {
  const uid = await getVerifiedUid();
  if (!uid) redirect("/sign-in");

  const groups = await getGroupsByUserId(uid);

  return <GroupListView groups={groups} />;
}
