"use client";

import { useState } from "react";

import type { Option } from "@/lib/types/option";

import { RankingTier, TIER_ORDER } from "./TierRanking.copy";
import { TierRankingView } from "./TierRankingView";

interface TierRankingProps {
  options: Option[];
}

export function TierRanking({ options }: TierRankingProps) {
  const [tierAssignments, setTierAssignments] = useState<
    Record<string, RankingTier>
  >({});

  function handleOptionClick(optionId: string) {
    setTierAssignments((prev) => {
      const current = prev[optionId] ?? RankingTier.Unranked;
      const currentIndex = TIER_ORDER.indexOf(current);
      const nextTier =
        TIER_ORDER[(currentIndex + 1) % TIER_ORDER.length] ??
        RankingTier.LoveIt;
      return { ...prev, [optionId]: nextTier };
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
