"use client";

import { useState } from "react";

import type { Option } from "@/lib/types/option";
import type { PriorPickBannerData } from "@/lib/types/ranking";
import { RankingTier } from "@/lib/types/ranking";
import { saveRankings } from "@/services/rankings";

import { PriorPickBannerView } from "./PriorPickBannerView";
import { TIER_ORDER } from "./TierRanking.copy";
import { TierRankingView } from "./TierRankingView";

interface TierRankingProps {
  categoryName?: string;
  groupId: string;
  categoryId: string;
  pickId: string;
  options: Option[];
  initialTierAssignments: Record<string, RankingTier>;
  priorPickBannerData?: PriorPickBannerData;
}

export function TierRanking({
  categoryName = "",
  groupId,
  categoryId,
  pickId,
  options,
  initialTierAssignments,
  priorPickBannerData,
}: TierRankingProps) {
  const [tierAssignments, setTierAssignments] = useState<
    Record<string, RankingTier>
  >(initialTierAssignments);
  const [prefillOptionIds, setPrefillOptionIds] = useState<ReadonlySet<string>>(
    new Set(),
  );

  const hasExistingAssignments = Object.keys(initialTierAssignments).length > 0;
  const [showBanner, setShowBanner] = useState(
    priorPickBannerData !== undefined && !hasExistingAssignments,
  );

  function handleOptionClick(optionId: string) {
    setTierAssignments((prev) => {
      const current = prev[optionId] ?? RankingTier.Unranked;
      const currentIndex = TIER_ORDER.indexOf(current);
      const nextTier =
        TIER_ORDER[(currentIndex + 1) % TIER_ORDER.length] ??
        RankingTier.LoveIt;
      const next = { ...prev, [optionId]: nextTier };
      saveRankings(groupId, categoryId, pickId, next).catch(() => {
        // fire-and-forget: ranking save failures are non-fatal
      });
      return next;
    });
  }

  function handlePrefill(assignments: Record<string, RankingTier>) {
    setTierAssignments(assignments);
    setPrefillOptionIds(new Set(Object.keys(assignments)));
    setShowBanner(false);
    saveRankings(groupId, categoryId, pickId, assignments).catch(() => {
      // fire-and-forget: ranking save failures are non-fatal
    });
  }

  return (
    <div className="space-y-4">
      {showBanner && priorPickBannerData !== undefined && (
        <PriorPickBannerView
          categoryName={categoryName}
          onDismiss={() => {
            setShowBanner(false);
          }}
          onPrefill={handlePrefill}
          onStartFresh={() => {
            setShowBanner(false);
          }}
          overlappingCount={priorPickBannerData.overlappingCount}
          pickTitle={priorPickBannerData.pickTitle}
          prefillAssignments={priorPickBannerData.prefillAssignments}
          rankedAt={priorPickBannerData.rankedAt}
        />
      )}
      <TierRankingView
        options={options}
        prefillOptionIds={prefillOptionIds}
        tierAssignments={tierAssignments}
        onOptionClick={handleOptionClick}
      />
    </div>
  );
}
