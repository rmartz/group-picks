import { notFound, redirect } from "next/navigation";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupById, getMemberDisplayNames } from "@/server/data/groups";
import { GroupDetailView } from "./GroupDetailView";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const uid = await getVerifiedUid();
  if (!uid) redirect("/sign-in");

  const { id } = await params;
  const group = await getGroupById(id);

  if (!group?.memberIds.includes(uid)) notFound();

  const members = await getMemberDisplayNames(group.memberIds);

  return <GroupDetailView group={group} members={members} />;
}
