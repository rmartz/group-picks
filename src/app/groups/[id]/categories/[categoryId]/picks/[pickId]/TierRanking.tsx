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
    setTierAssignments((prev) => {
      const current = prev[optionId] ?? RankingTier.Unranked;
      const currentIndex = TIER_ORDER.indexOf(current);
      const nextTier =
        TIER_ORDER[(currentIndex + 1) % TIER_ORDER.length] ??
        RankingTier.LoveIt;
      const next = { ...prev, [optionId]: nextTier };
      saveRankings(groupId, categoryId, pickId, next).catch(() => {});
      return next;
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
