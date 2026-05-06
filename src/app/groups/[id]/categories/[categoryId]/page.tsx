import { notFound, redirect } from "next/navigation";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupById } from "@/server/data/groups";
import { getCategoryById } from "@/server/data/categories";
import { CategoryDetailView } from "./CategoryDetailView";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string; categoryId: string }>;
}) {
  const uid = await getVerifiedUid();
  if (!uid) redirect("/sign-in");

  const { id, categoryId } = await params;
  const group = await getGroupById(id);

  if (!group) notFound();
  if (!group.memberIds.includes(uid)) notFound();

  const category = await getCategoryById(categoryId);

  if (!category) notFound();
  if (category.groupId !== id) notFound();

  return <CategoryDetailView category={category} />;
}
