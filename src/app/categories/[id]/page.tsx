import { notFound, redirect } from "next/navigation";
import { getVerifiedUid } from "@/server/utils/auth";
import { getCategoryById } from "@/server/data/categories";
import { getPicksByCategory } from "@/server/data/picks";
import { CategoryDetailView } from "./CategoryDetailView";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const uid = await getVerifiedUid();
  if (!uid) redirect("/sign-in");

  const { id } = await params;
  const [category, picks] = await Promise.all([
    getCategoryById(id),
    getPicksByCategory(id),
  ]);

  if (!category) notFound();

  return <CategoryDetailView category={category} picks={picks} />;
}
