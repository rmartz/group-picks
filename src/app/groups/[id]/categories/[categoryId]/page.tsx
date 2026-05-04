import { notFound, redirect } from "next/navigation";
import { getVerifiedUid } from "@/server/utils/auth";
import { getCategoryById } from "@/server/data/categories";
import { CategoryDetailView } from "./CategoryDetailView";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string; categoryId: string }>;
}) {
  const uid = await getVerifiedUid();
  if (!uid) redirect("/sign-in");

  const { categoryId } = await params;
  const category = await getCategoryById(categoryId);

  if (!category) notFound();

  return <CategoryDetailView category={category} />;
}
