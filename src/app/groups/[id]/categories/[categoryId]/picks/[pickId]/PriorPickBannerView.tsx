"use client";

import type { RankingTier } from "@/lib/types/ranking";

import { PRIOR_PICK_BANNER_COPY } from "./PriorPickBannerView.copy";

interface PriorPickBannerViewProps {
  categoryName: string;
  onDismiss: () => void;
  onPrefill: (assignments: Record<string, RankingTier>) => void;
  onStartFresh: () => void;
  overlappingCount: number;
  pickTitle: string;
  prefillAssignments: Record<string, RankingTier>;
  rankedAt: Date;
}

export function PriorPickBannerView({
  categoryName,
  onDismiss,
  onPrefill,
  onStartFresh,
  overlappingCount,
  pickTitle,
  prefillAssignments,
  rankedAt,
}: PriorPickBannerViewProps) {
  return (
    <div className="rounded-lg border bg-muted/50 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-medium">
            {PRIOR_PICK_BANNER_COPY.heading(categoryName)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {pickTitle} &middot; {PRIOR_PICK_BANNER_COPY.rankedLabel}{" "}
            {rankedAt.toLocaleDateString()} &middot; {overlappingCount}{" "}
            {PRIOR_PICK_BANNER_COPY.overlapSuffix}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground"
          aria-label={PRIOR_PICK_BANNER_COPY.dismissLabel}
        >
          ×
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            onPrefill(prefillAssignments);
          }}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
        >
          {PRIOR_PICK_BANNER_COPY.prefillButton}
        </button>
        <button
          type="button"
          onClick={onStartFresh}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
        >
          {PRIOR_PICK_BANNER_COPY.startFreshButton}
        </button>
      </div>
    </div>
  );
}
