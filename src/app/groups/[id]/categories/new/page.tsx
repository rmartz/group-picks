import { notFound, redirect } from "next/navigation";

import { getGroupById } from "@/server/data/groups";
import { getVerifiedUid } from "@/server/utils/auth";

import { CreateCategoryForm } from "./CreateCategoryForm";

export default async function CreateCategoryPage({
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

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <CreateCategoryForm groupId={id} />
    </main>
  );
}
