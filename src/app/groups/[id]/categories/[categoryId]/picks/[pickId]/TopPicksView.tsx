import type { Option } from "@/lib/types/option";

import { TOP_PICKS_VIEW_COPY } from "./TopPicksView.copy";

interface TopPicksViewProps {
  isOpen: boolean;
  topPicks: Option[];
  topCount: number;
}

export function TopPicksView({
  isOpen,
  topPicks,
  topCount,
}: TopPicksViewProps) {
  if (isOpen) {
    return (
      <p className="text-sm text-muted-foreground">
        {TOP_PICKS_VIEW_COPY.lockedMessage}
      </p>
    );
  }

  if (topPicks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {TOP_PICKS_VIEW_COPY.noResultsMessage}
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {topPicks.slice(0, topCount).map((option, index) => (
        <li key={option.id} className="flex items-center gap-3 text-sm">
          <span className="w-8 font-mono text-muted-foreground">
            #{index + 1}
          </span>
          <span>{option.title}</span>
        </li>
      ))}
    </ol>
  );
}
