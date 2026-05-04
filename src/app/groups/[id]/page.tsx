import { notFound, redirect } from "next/navigation";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupById } from "@/server/data/groups";
import { getCategoriesByGroupId } from "@/server/data/categories";
import { GroupDetailView } from "./GroupDetailView";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const uid = await getVerifiedUid();
  if (!uid) redirect("/sign-in");

  const { id } = await params;
  const [group, categories] = await Promise.all([
    getGroupById(id),
    getCategoriesByGroupId(id),
  ]);

  if (!group) notFound();

  return <GroupDetailView group={group} categories={categories} />;
}
