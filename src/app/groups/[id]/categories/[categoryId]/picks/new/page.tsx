import { notFound, redirect } from "next/navigation";

import { getCategoryById } from "@/server/data/categories";
import { getGroupById } from "@/server/data/groups";
import { hasPicks } from "@/server/data/picks";
import { getVerifiedUid } from "@/server/utils/auth";

import { NewPickTypeSwitcher } from "./NewPickTypeSwitcher";

export default async function CreatePickPage({
  params,
}: {
  params: Promise<{ id: string; categoryId: string }>;
}) {
  const uid = await getVerifiedUid();
  if (!uid) redirect("/sign-in");

  const { id: groupId, categoryId } = await params;
  const [group, category] = await Promise.all([
    getGroupById(groupId),
    getCategoryById(categoryId),
  ]);

  if (!group) notFound();
  if (!group.memberIds.includes(uid)) notFound();
  if (category?.groupId !== groupId) notFound();

  const hasPriorPicks = await hasPicks(categoryId);

  return (
    <main className="mx-auto max-w-lg p-6">
      <NewPickTypeSwitcher
        groupId={groupId}
        categoryId={categoryId}
        hasPriorPicks={hasPriorPicks}
      />
    </main>
  );
}
