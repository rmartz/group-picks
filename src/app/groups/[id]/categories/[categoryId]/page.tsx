import { notFound, redirect } from "next/navigation";
import { getVerifiedUid } from "@/server/utils/auth";
import { getCategoriesByGroupId } from "@/server/data/categories";
import { CategoryDetailView } from "./CategoryDetailView";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string; categoryId: string }>;
}) {
  const uid = await getVerifiedUid();
  if (!uid) redirect("/sign-in");

  const { id, categoryId } = await params;
  const categories = await getCategoriesByGroupId(id);
  const category = categories.find((c) => c.id === categoryId);

  if (!category) notFound();

  return <CategoryDetailView category={category} />;
}
