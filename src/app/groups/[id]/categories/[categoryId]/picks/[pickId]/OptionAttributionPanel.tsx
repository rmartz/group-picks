import type { OptionTierAttribution } from "@/lib/ranking-score";
import { RankingTier } from "@/lib/types/ranking";
import { cn } from "@/lib/utils";

import { CLOSED_PICK_RESULTS_COPY } from "./ClosedPickResultsView.copy";

const ATTRIBUTION_ROWS = [
  { key: RankingTier.LoveIt, label: CLOSED_PICK_RESULTS_COPY.tiers.loveIt },
  { key: RankingTier.Yes, label: CLOSED_PICK_RESULTS_COPY.tiers.yes },
  { key: RankingTier.Maybe, label: CLOSED_PICK_RESULTS_COPY.tiers.maybe },
  { key: RankingTier.NotForMe, label: CLOSED_PICK_RESULTS_COPY.tiers.notForMe },
  { key: "noRank" as const, label: CLOSED_PICK_RESULTS_COPY.tiers.noRank },
] as const;

interface OptionAttributionPanelProps {
  attribution: OptionTierAttribution;
}

export function OptionAttributionPanel({
  attribution,
}: OptionAttributionPanelProps) {
  return (
    <div className="mt-3 space-y-2 border-t pt-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {CLOSED_PICK_RESULTS_COPY.attributionHeading}
      </p>
      {ATTRIBUTION_ROWS.map((row) => {
        const members = attribution[row.key];
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
                    {(member.firstName.charAt(0) || "?").toUpperCase()}
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
                  ? members.map((m) => m.firstName).join(", ")
                  : CLOSED_PICK_RESULTS_COPY.noMembersLabel}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
