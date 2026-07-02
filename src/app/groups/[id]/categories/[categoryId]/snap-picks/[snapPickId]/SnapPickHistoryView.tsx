import type { SnapPickHistoryEntry } from "@/lib/types/snap-pick";

import { SNAP_PICK_HISTORY_COPY } from "./SnapPickHistory.copy";

export interface SnapPickHistoryViewProps {
  // Closed activations resolved into display entries, newest first.
  entries: SnapPickHistoryEntry[];
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

// Tallies wins per winning-option title across the history, sorted by win count
// descending (ties broken alphabetically for a stable order). Entries with no
// recorded winner are excluded from the frequency summary.
function topPicks(entries: SnapPickHistoryEntry[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    if (entry.winnerTitle === undefined) continue;
    counts.set(entry.winnerTitle, (counts.get(entry.winnerTitle) ?? 0) + 1);
  }
  return [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
}

export function SnapPickHistoryView({ entries }: SnapPickHistoryViewProps) {
  const ranked = topPicks(entries);
  return (
    <div className="space-y-3">
      {ranked.length > 0 && (
        <p
          className="text-sm text-muted-foreground"
          data-testid="snap-pick-history-summary"
        >
          <span className="font-medium">
            {SNAP_PICK_HISTORY_COPY.topPicksLabel}
          </span>{" "}
          {ranked
            .map(([title, wins]) =>
              SNAP_PICK_HISTORY_COPY.winCount(title, wins),
            )
            .join(", ")}
        </p>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {SNAP_PICK_HISTORY_COPY.emptyState}
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.activationId}
              className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
            >
              <span className="min-w-0 flex-1 font-medium">
                {entry.winnerTitle ?? SNAP_PICK_HISTORY_COPY.noWinnerTitle}
              </span>
              <span className="shrink-0 text-muted-foreground">
                {dateFormatter.format(entry.closedAt)}
              </span>
              <span className="shrink-0 text-muted-foreground">
                {SNAP_PICK_HISTORY_COPY.participantCount(
                  entry.participantCount,
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
