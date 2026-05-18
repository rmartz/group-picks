"use client";

import { useState } from "react";

import type { Option } from "@/lib/types/option";
import { RankingTier } from "@/lib/types/ranking";
import { saveRankings } from "@/services/rankings";

import { TIER_ORDER } from "./TierRanking.copy";
import { TierRankingView } from "./TierRankingView";

interface TierRankingProps {
  groupId: string;
  categoryId: string;
  pickId: string;
  options: Option[];
  initialTierAssignments: Record<string, RankingTier>;
}

export function TierRanking({
  groupId,
  categoryId,
  pickId,
  options,
  initialTierAssignments,
}: TierRankingProps) {
  const [tierAssignments, setTierAssignments] = useState<
    Record<string, RankingTier>
  >(initialTierAssignments);

  function handleOptionClick(optionId: string) {
    const current = tierAssignments[optionId] ?? RankingTier.Unranked;
    const currentIndex = TIER_ORDER.indexOf(current);
    const nextTier =
      TIER_ORDER[(currentIndex + 1) % TIER_ORDER.length] ?? RankingTier.LoveIt;
    const next = { ...tierAssignments, [optionId]: nextTier };

    setTierAssignments(next);
    saveRankings(groupId, categoryId, pickId, next).catch(() => {
      // fire-and-forget: ranking save failures are non-fatal
    });
  }

  return (
    <TierRankingView
      options={options}
      tierAssignments={tierAssignments}
      onOptionClick={handleOptionClick}
    />
  );
}
