"use client";

import { useState } from "react";

import type { OptionTierAttribution } from "@/lib/ranking-score";
import type { Option } from "@/lib/types/option";
import { RankingTier } from "@/lib/types/ranking";
import { cn } from "@/lib/utils";

import { TOP_PICKS_VIEW_COPY } from "./TopPicksView.copy";

interface TopPicksViewProps {
  isOpen: boolean;
  topPicks: Option[];
  topCount: number;
  topPickAttribution?: Record<string, OptionTierAttribution>;
}

const ATTRIBUTION_ROWS = [
  { key: RankingTier.LoveIt, label: TOP_PICKS_VIEW_COPY.tiers.loveIt },
  { key: RankingTier.Yes, label: TOP_PICKS_VIEW_COPY.tiers.yes },
  { key: RankingTier.Maybe, label: TOP_PICKS_VIEW_COPY.tiers.maybe },
  {
    key: RankingTier.NotReally,
    label: TOP_PICKS_VIEW_COPY.tiers.notForMe,
  },
  { key: "noRank", label: TOP_PICKS_VIEW_COPY.tiers.noRank },
] as const;

export function TopPicksView({
  isOpen,
  topPicks,
  topCount,
  topPickAttribution,
}: TopPicksViewProps) {
  const [expandedOptionId, setExpandedOptionId] = useState<string | undefined>(
    undefined,
  );

  const topPicksToRender = topPicks.slice(0, topCount);

  return isOpen || topPicks.length === 0 ? (
    <p className="text-sm text-muted-foreground">
      {isOpen
        ? TOP_PICKS_VIEW_COPY.lockedMessage
        : TOP_PICKS_VIEW_COPY.noResultsMessage}
    </p>
  ) : (
    <ol className="space-y-2">
      {topPicksToRender.map((option, index) => {
        const isExpanded = expandedOptionId === option.id;
        const attribution = topPickAttribution?.[option.id];

        return (
          <li key={option.id} className="rounded-md border p-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setExpandedOptionId((current) =>
                  current === option.id ? undefined : option.id,
                );
              }}
              aria-expanded={isExpanded}
              className="flex w-full items-center gap-3 text-left"
            >
              <span className="w-8 font-mono text-muted-foreground">
                #{index + 1}
              </span>
              <span>{option.title}</span>
            </button>
            {isExpanded && (
              <div className="mt-3 space-y-2 border-t pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {TOP_PICKS_VIEW_COPY.attributionHeading}
                </p>
                {ATTRIBUTION_ROWS.map((row) => {
                  const members = attribution?.[row.key] ?? [];
                  return (
                    <div
                      key={row.key}
                      className={cn(
                        "grid grid-cols-[96px_1fr] items-start gap-3",
                        row.key === "noRank" && "opacity-60",
                      )}
                    >
                      <span className="text-xs font-medium text-muted-foreground">
                        {row.label}
                      </span>
                      <div className="space-y-1">
                        <div className="flex -space-x-2">
                          {members.slice(0, 6).map((member) => (
                            <span
                              key={member.uid}
                              aria-hidden="true"
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full border bg-background text-[10px] font-semibold"
                              title={member.firstName}
                            >
                              {(
                                member.firstName.charAt(0) || "?"
                              ).toUpperCase()}
                            </span>
                          ))}
                          {members.length > 6 && (
                            <span
                              aria-hidden="true"
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full border bg-muted text-[10px] font-semibold"
                              title={"+" + String(members.length - 6) + " more"}
                            >
                              +{members.length - 6}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {members.length > 0
                            ? members
                                .map((member) => member.firstName)
                                .join(", ")
                            : TOP_PICKS_VIEW_COPY.noMembersLabel}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
