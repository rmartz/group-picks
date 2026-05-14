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
  params: Promise<{ id: string; categoryId: string }>;
}) {
  const uid = await getVerifiedUid();
  if (!uid) redirect("/sign-in");

  const { id, categoryId } = await params;
  const group = await getGroupById(id);

  if (!group?.memberIds.includes(uid)) notFound();

  const [category, picks] = await Promise.all([
    getCategoryById(categoryId),
    getPicksByCategory(categoryId),
  ]);

  if (!category) notFound();
  if (category.groupId !== id) notFound();

  async function closePickAction(formData: FormData) {
    "use server";

    const actionUid = await getVerifiedUid();
    if (!actionUid) redirect("/sign-in");

    const latestGroup = await getGroupById(id);
    if (!latestGroup?.memberIds.includes(actionUid)) {
      throw new Error(CATEGORY_DETAIL_COPY.closePickError);
    }

    const latestCategory = await getCategoryById(categoryId);
    if (latestCategory?.groupId !== id) {
      throw new Error(CATEGORY_DETAIL_COPY.closePickError);
    }

    const pickId = formData.get("pickId");
    if (typeof pickId !== "string" || !pickId.trim()) {
      throw new Error(CATEGORY_DETAIL_COPY.closePickError);
    }

    await closePick(categoryId, pickId);

    revalidatePath(`/groups/${id}/categories/${categoryId}`);
  }

  return (
    <CategoryDetailView
      category={category}
      closePickAction={closePickAction}
      picks={picks}
    />
  );
}
