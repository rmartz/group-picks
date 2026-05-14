"use client";

import { useState } from "react";
import type { Option } from "@/lib/types/option";
import { RankingTier } from "./TierRanking.copy";
import { TierRankingView } from "./TierRankingView";

interface TierRankingProps {
  options: Option[];
}

const TIER_CYCLE = [
  RankingTier.LoveIt,
  RankingTier.Yes,
  RankingTier.Maybe,
  RankingTier.NotReally,
  RankingTier.Unranked,
] as const;

export function TierRanking({ options }: TierRankingProps) {
  const [tierAssignments, setTierAssignments] = useState<
    Record<string, RankingTier>
  >({});

  function handleOptionClick(optionId: string) {
    const current = tierAssignments[optionId] ?? RankingTier.Unranked;
    const currentIndex = TIER_CYCLE.indexOf(current);
    const nextTier =
      TIER_CYCLE[(currentIndex + 1) % TIER_CYCLE.length] ?? RankingTier.LoveIt;
    const next = { ...tierAssignments };
    next[optionId] = nextTier;
    setTierAssignments(next);
  }

  return (
    <TierRankingView
      options={options}
      tierAssignments={tierAssignments}
      onOptionClick={handleOptionClick}
    />
  );
}
