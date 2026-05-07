import { notFound, redirect } from "next/navigation";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupById } from "@/server/data/groups";
import { getCategoriesByGroupId } from "@/server/data/categories";
import { getPicksByGroup } from "@/server/data/picks";
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

  if (!group) notFound();

  if (!group.memberIds.includes(uid)) notFound();

  const categories = await getCategoriesByGroupId(id);
  const picks = await getPicksByGroup(categories.map((c) => c.id));

  return <GroupDetailView group={group} categories={categories} picks={picks} />;
}
