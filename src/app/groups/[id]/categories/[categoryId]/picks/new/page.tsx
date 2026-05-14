import { notFound, redirect } from "next/navigation";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupById } from "@/server/data/groups";
import { getCategoryById } from "@/server/data/categories";
import { getPicksByCategory } from "@/server/data/picks";
import { CreatePickForm } from "./CreatePickForm";

export default async function CreatePickPage({
  params,
}: {
  params: Promise<{ id: string; categoryId: string }>;
}) {
  const uid = await getVerifiedUid();
  if (!uid) redirect("/sign-in");

  const { id: groupId, categoryId } = await params;
  const [group, category, picks] = await Promise.all([
    getGroupById(groupId),
    getCategoryById(categoryId),
    getPicksByCategory(categoryId),
  ]);

  if (!group) notFound();
  if (!group.memberIds.includes(uid)) notFound();
  if (category?.groupId !== groupId) notFound();

  return (
    <main className="mx-auto max-w-lg p-6">
      <CreatePickForm
        groupId={groupId}
        categoryId={categoryId}
        hasPriorPicks={picks.length > 0}
      />
    </main>
  );
}
