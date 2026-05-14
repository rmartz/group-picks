import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { getCategoryById } from "@/server/data/categories";
import { getGroupById } from "@/server/data/groups";
import { closePick, getPicksByCategory } from "@/server/data/picks";
import { getVerifiedUid } from "@/server/utils/auth";

import { CategoryDetailView } from "./CategoryDetailView";
import { CATEGORY_DETAIL_COPY } from "./copy";

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

  const group = await getGroupById(category.groupId);
  if (!group) notFound();

  const canClosePicks = group.memberIds.includes(uid);

  async function closePickAction(formData: FormData) {
    "use server";

    const actionUid = await getVerifiedUid();
    if (!actionUid) redirect("/sign-in");

    const latestCategory = await getCategoryById(id);
    if (!latestCategory) throw new Error(CATEGORY_DETAIL_COPY.closePickError);

    const latestGroup = await getGroupById(latestCategory.groupId);
    if (!latestGroup?.memberIds.includes(actionUid)) {
      throw new Error(CATEGORY_DETAIL_COPY.closePickError);
    }

    const pickId = formData.get("pickId");
    if (typeof pickId !== "string" || !pickId.trim()) {
      throw new Error(CATEGORY_DETAIL_COPY.closePickError);
    }

    await closePick(id, pickId);

    revalidatePath(`/categories/${id}`);
  }

  return (
    <CategoryDetailView
      category={category}
      closePickAction={canClosePicks ? closePickAction : undefined}
      picks={picks}
    />
  );
}
