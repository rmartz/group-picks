import { notFound, redirect } from "next/navigation";

import { getCategoryById } from "@/server/data/categories";
import { getGroupById } from "@/server/data/groups";
import { getOptionsByCategory, getOptionsByPick } from "@/server/data/options";
import { getPickById, getPicksByCategory } from "@/server/data/picks";
import { getVerifiedUid } from "@/server/utils/auth";

import { OptionList } from "./OptionList";

export default async function PickDetailPage({
  params,
}: {
  params: Promise<{ id: string; pickId: string }>;
}) {
  const uid = await getVerifiedUid();
  if (!uid) redirect("/sign-in");

  const { id: categoryId, pickId } = await params;

  const category = await getCategoryById(categoryId);
  if (!category) notFound();

  const group = await getGroupById(category.groupId);
  if (!group?.memberIds.includes(uid)) notFound();

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
  const suggestions = priorOptions.filter(
    (o) =>
      o.ownerIds.includes(uid) &&
      !currentTitlesLower.has(o.title.toLowerCase()),
  );

  const uniqueSuggestionTitles = new Set<string>();
  const dedupedSuggestions = suggestions.filter((o) => {
    const key = o.title.toLowerCase();
    if (uniqueSuggestionTitles.has(key)) return false;
    uniqueSuggestionTitles.add(key);
    return true;
  });

  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{pick.title}</h1>
        {pick.description?.trim() && (
          <p className="text-sm text-muted-foreground">{pick.description}</p>
        )}
      </div>
      <OptionList
        groupId={group.id}
        categoryId={categoryId}
        pickId={pickId}
        currentUserId={uid}
        initialOptions={currentOptions}
        initialSuggestions={dedupedSuggestions}
        pickClosed={pick.closedAt !== undefined}
      />
    </main>
  );
}
