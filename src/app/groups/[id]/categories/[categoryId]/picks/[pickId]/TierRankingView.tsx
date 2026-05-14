"use client";

import type { Option } from "@/lib/types/option";
import { RankingTier, TIER_RANKING_COPY } from "./TierRanking.copy";

interface TierRankingViewProps {
  options: Option[];
  tierAssignments: Record<string, RankingTier>;
  onOptionClick: (optionId: string) => void;
}

const TIER_ORDER = [
  RankingTier.LoveIt,
  RankingTier.Yes,
  RankingTier.Maybe,
  RankingTier.NotReally,
  RankingTier.Unranked,
] as const;

export function TierRankingView({
  options,
  tierAssignments,
  onOptionClick,
}: TierRankingViewProps) {
  return (
    <div className="space-y-4">
      {TIER_ORDER.map((tier) => (
        <div key={tier}>
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
            {TIER_RANKING_COPY.tiers[tier]}
          </h3>
          <div className="flex min-h-10 flex-wrap gap-2 rounded-md border p-2">
            {options
              .filter(
                (opt) =>
                  (tierAssignments[opt.id] ?? RankingTier.Unranked) === tier,
              )
              .map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onOptionClick(opt.id);
                  }}
                  className="rounded-full border bg-background px-3 py-1 text-sm hover:bg-muted"
                >
                  {opt.title}
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
