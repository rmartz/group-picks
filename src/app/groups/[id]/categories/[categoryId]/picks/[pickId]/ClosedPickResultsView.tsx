"use client";

import type { ClosedPickResultEntry } from "@/lib/computePickResults";

import { CLOSED_PICK_RESULTS_COPY } from "./ClosedPickResultsView.copy";

interface ClosedPickResultsViewProps {
  topCount: number;
  closedAt: Date;
  topPicks: ClosedPickResultEntry[];
  runnersUp: ClosedPickResultEntry[];
  onReopen?: () => void;
}

function groupByRank(
  entries: ClosedPickResultEntry[],
): [number, ClosedPickResultEntry[]][] {
  const map = new Map<number, ClosedPickResultEntry[]>();
  for (const entry of entries) {
    const group = map.get(entry.rank) ?? [];
    group.push(entry);
    map.set(entry.rank, group);
  }
  return [...map.entries()].sort(([a], [b]) => a - b);
}

interface ResultRowProps {
  entry: ClosedPickResultEntry;
  showCrown: boolean;
}

function ResultRow({ entry, showCrown }: ResultRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-8 text-center text-sm font-semibold text-muted-foreground">
        #{entry.rank}
      </span>
      <span className="flex-1 text-sm font-medium">{entry.option.title}</span>
      {showCrown && <span aria-hidden="true">👑</span>}
      <span className="text-sm tabular-nums text-muted-foreground">
        {entry.score}
      </span>
    </div>
  );
}

export function ClosedPickResultsView({
  topCount,
  topPicks,
  runnersUp,
  onReopen,
}: ClosedPickResultsViewProps) {
  const isEmpty = topPicks.length === 0 && runnersUp.length === 0;
  const topPicksByRank = groupByRank(topPicks);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
          {CLOSED_PICK_RESULTS_COPY.closedChip}
        </span>
        <span className="text-xs text-muted-foreground">
          {CLOSED_PICK_RESULTS_COPY.topCountPrefix} <span>{topCount}</span>
        </span>
      </div>

      {isEmpty ? (
        <p className="text-sm text-muted-foreground">
          {CLOSED_PICK_RESULTS_COPY.noResultsMessage}
        </p>
      ) : (
        <>
          <div className="divide-y rounded-md border">
            {topPicksByRank.map(([rank, entries]) =>
              entries.length > 1 ? (
                <div
                  key={rank}
                  className="rounded-md border-2 border-dashed border-muted-foreground/30 p-2"
                >
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    {CLOSED_PICK_RESULTS_COPY.tieLabel} {rank}
                  </p>
                  {entries.map((entry) => (
                    <ResultRow
                      key={entry.option.id}
                      entry={entry}
                      showCrown={entry.rank === 1}
                    />
                  ))}
                </div>
              ) : (
                entries[0] && (
                  <ResultRow
                    key={entries[0].option.id}
                    entry={entries[0]}
                    showCrown={entries[0].rank === 1}
                  />
                )
              ),
            )}
          </div>

          {runnersUp.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">
                {CLOSED_PICK_RESULTS_COPY.runnersUpHeading}
              </h3>
              <div className="divide-y rounded-md border">
                {runnersUp.map((entry) => (
                  <ResultRow
                    key={entry.option.id}
                    entry={entry}
                    showCrown={false}
                  />
                ))}
              </div>
            </div>
          )}

          {onReopen !== undefined && (
            <div className="rounded-md border p-4 text-center">
              <p className="text-sm font-semibold">
                {CLOSED_PICK_RESULTS_COPY.reopenCard.heading}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {CLOSED_PICK_RESULTS_COPY.reopenCard.body}
              </p>
              <button
                type="button"
                onClick={onReopen}
                className="mt-3 rounded border px-3 py-1 text-xs font-medium text-blue-600"
              >
                {CLOSED_PICK_RESULTS_COPY.reopenCard.button}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
