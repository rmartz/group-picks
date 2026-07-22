import { notFound, redirect } from "next/navigation";

import {
  computeOptionTierAttribution,
  computeRankedResults,
} from "@/lib/ranking-score";
import type { PriorPickBannerData, RankingTier } from "@/lib/types/ranking";
import { getCategoryById } from "@/server/data/categories";
import { getGroupById, getMemberDisplayNames } from "@/server/data/groups";
import { getOptionsByCategory, getOptionsByPick } from "@/server/data/options";
import { getPickById, getPicksByCategory } from "@/server/data/picks";
import {
  getAllRankingsForPick,
  getRankingByUser,
  getRankingsByUser,
} from "@/server/data/rankings";
import { getVerifiedUid } from "@/server/utils/auth";
import { isGroupAdmin } from "@/server/utils/permissions";

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

  const isClosed = pick.closedAt !== undefined;

  const [
    currentOptions,
    allPicks,
    initialTierAssignments,
    allRankings,
    memberNames,
  ] = await Promise.all([
    getOptionsByPick(pickId),
    getPicksByCategory(categoryId),
    getRankingByUser(pickId, uid),
    isClosed ? getAllRankingsForPick(pickId) : Promise.resolve({}),
    isClosed ? getMemberDisplayNames(group.memberIds) : Promise.resolve([]),
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

  const filteredRankings = Object.fromEntries(
    Object.entries(allRankings).filter(([uid]) =>
      group.memberIds.includes(uid),
    ),
  ) as Record<string, Record<string, RankingTier>>;

  const closedPickResults = computeRankedResults(
    filteredRankings,
    currentOptions,
    pick.topCount,
  );
  const topPickAttribution = computeOptionTierAttribution(
    filteredRankings,
    currentOptions,
    memberNames,
  );

  let priorPickBannerData: PriorPickBannerData | undefined;
  if (
    Object.keys(initialTierAssignments).length === 0 &&
    priorPickIds.length > 0
  ) {
    const priorRankings = await getRankingsByUser(priorPickIds, uid);
    const currentOptionsByTitle = new Map(
      currentOptions.map((o) => [o.title.toLowerCase(), o]),
    );
    const sortedPriorPicks = allPicks
      .filter((p) => p.id !== pickId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    for (const priorPick of sortedPriorPicks) {
      const userRankings = priorRankings[priorPick.id];
      if (!userRankings) continue;

      const pickOptions = priorOptions.filter((o) => o.pickId === priorPick.id);
      const overlappingOptions = pickOptions.filter((o) =>
        currentOptionsByTitle.has(o.title.toLowerCase()),
      );
      if (overlappingOptions.length === 0) continue;

      const prefillAssignments: Record<string, RankingTier> = {};
      for (const priorOpt of overlappingOptions) {
        const tier = userRankings[priorOpt.id];
        const currentOpt = currentOptionsByTitle.get(
          priorOpt.title.toLowerCase(),
        );
        if (tier !== undefined && currentOpt !== undefined) {
          prefillAssignments[currentOpt.id] = tier;
        }
      }
      if (Object.keys(prefillAssignments).length === 0) continue;

      priorPickBannerData = {
        overlappingCount: overlappingOptions.length,
        pickTitle: priorPick.title,
        prefillAssignments,
        rankedAt: priorPick.closedAt ?? priorPick.createdAt,
      };
      break;
    }
  }

  return (
    <PickDetailView
      pick={pick}
      groupId={groupId}
      groupName={group.name}
      categoryId={categoryId}
      categoryName={category.name}
      currentUserId={uid}
      initialOptions={currentOptions}
      initialSuggestions={suggestions}
      initialTierAssignments={initialTierAssignments}
      priorPickBannerData={priorPickBannerData}
      closedPickResults={closedPickResults}
      topPickAttribution={topPickAttribution}
      isAdmin={isGroupAdmin(uid, group)}
    />
  );
}
