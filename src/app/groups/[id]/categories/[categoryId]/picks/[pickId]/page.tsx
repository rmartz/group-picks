import { notFound, redirect } from "next/navigation";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupById } from "@/server/data/groups";
import { getCategoryById } from "@/server/data/categories";
import { getPickById, getPicksByCategory } from "@/server/data/picks";
import { getOptionsByPick, getOptionsByCategory } from "@/server/data/options";
import { PickDetailView } from "./PickDetailView";

export default async function PickDetailPage({
  params,
}: {
  params: Promise<{ id: string; categoryId: string; pickId: string }>;
}) {
  const uid = await getVerifiedUid();
  if (!uid) redirect("/sign-in");

  const { id: groupId, categoryId, pickId } = await params;

  const group = await getGroupById(groupId);
  if (!group?.memberIds.includes(uid)) notFound();

  const category = await getCategoryById(categoryId);
  if (category?.groupId !== groupId) notFound();

  const pick = await getPickById(categoryId, pickId);
  if (!pick) notFound();

  const [currentOptions, allPicks] = await Promise.all([
    getOptionsByPick(pickId),
    getPicksByCategory(categoryId),
  ]);

  const priorPickIds = allPicks.filter((p) => p.id !== pickId).map((p) => p.id);
  const priorOptions = await getOptionsByCategory(priorPickIds);

  const currentTitlesLower = new Set(
    currentOptions.map((o) => o.title.toLowerCase()),
  );
  const uniqueSuggestionTitles = new Set<string>();
  const suggestions = priorOptions
    .filter(
      (o) =>
        o.ownerIds.includes(uid) &&
        !currentTitlesLower.has(o.title.toLowerCase()),
    )
    .filter((o) => {
      const key = o.title.toLowerCase();
      if (uniqueSuggestionTitles.has(key)) return false;
      uniqueSuggestionTitles.add(key);
      return true;
    });

  return (
    <PickDetailView
      pick={pick}
      groupId={groupId}
      categoryId={categoryId}
      currentUserId={uid}
      initialOptions={currentOptions}
      initialSuggestions={suggestions}
    />
  );
}
