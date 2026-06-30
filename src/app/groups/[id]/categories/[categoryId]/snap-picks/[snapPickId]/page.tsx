import { notFound, redirect } from "next/navigation";

import { getCategoryById } from "@/server/data/categories";
import { getGroupById } from "@/server/data/groups";
import { getSnapPickById } from "@/server/data/snap-picks";
import { getVerifiedUid } from "@/server/utils/auth";

import { SnapPickDetailView } from "./SnapPickDetailView";

export default async function SnapPickDetailPage({
  params,
}: {
  params: Promise<{ id: string; categoryId: string; snapPickId: string }>;
}) {
  const uid = await getVerifiedUid();
  if (!uid) redirect("/sign-in");

  const { id, categoryId, snapPickId } = await params;

  const [group, category, snapPick] = await Promise.all([
    getGroupById(id),
    getCategoryById(categoryId),
    getSnapPickById(categoryId, snapPickId),
  ]);

  if (!group?.memberIds.includes(uid)) notFound();
  if (category?.groupId !== id) notFound();
  if (!snapPick) notFound();

  return <SnapPickDetailView snapPick={snapPick} />;
}
