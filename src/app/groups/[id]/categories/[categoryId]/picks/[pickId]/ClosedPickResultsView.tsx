"use client";

import { useState } from "react";

import type {
  ClosedPickResultEntry,
  OptionTierAttribution,
} from "@/lib/ranking-score";

import { CLOSED_PICK_RESULTS_COPY } from "./ClosedPickResultsView.copy";
import { OptionAttributionPanel } from "./OptionAttributionPanel";

interface ClosedPickResultsViewProps {
  topCount: number;
  topPicks: ClosedPickResultEntry[];
  runnersUp: ClosedPickResultEntry[];
  topPickAttribution?: Record<string, OptionTierAttribution>;
  onReopen?: () => void;
  isReopening?: boolean;
  reopenError?: string;
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
  attribution?: OptionTierAttribution;
  isExpanded?: boolean;
  onToggle?: () => void;
}

function ResultRow({
  entry,
  showCrown,
  attribution,
  isExpanded = false,
  onToggle,
}: ResultRowProps) {
  const header = (
    <>
      <span className="w-8 text-center text-sm font-semibold text-muted-foreground">
        #{entry.rank}
      </span>
      <span className="flex-1 text-sm font-medium">{entry.option.title}</span>
      {showCrown && <span aria-hidden="true">👑</span>}
      <span className="text-sm tabular-nums text-muted-foreground">
        {entry.score}
      </span>
    </>
  );

  return (
    <div className="py-2">
      {onToggle !== undefined ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          className="flex w-full items-center gap-3 text-left"
        >
          {header}
        </button>
      ) : (
        <div className="flex items-center gap-3">{header}</div>
      )}
      {attribution !== undefined && isExpanded && (
        <OptionAttributionPanel attribution={attribution} />
      )}
    </div>
  );
}

export function ClosedPickResultsView({
  topCount,
  topPicks,
  runnersUp,
  topPickAttribution,
  onReopen,
  isReopening = false,
  reopenError,
}: ClosedPickResultsViewProps) {
  const [expandedOptionId, setExpandedOptionId] = useState<string | undefined>(
    undefined,
  );
  const isEmpty = topPicks.length === 0 && runnersUp.length === 0;
  const topPicksByRank = groupByRank(topPicks);

  function toggleOption(optionId: string) {
    setExpandedOptionId((current) =>
      current === optionId ? undefined : optionId,
    );
  }

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
                      attribution={topPickAttribution?.[entry.option.id]}
                      isExpanded={expandedOptionId === entry.option.id}
                      onToggle={
                        topPickAttribution !== undefined
                          ? () => {
                              toggleOption(entry.option.id);
                            }
                          : undefined
                      }
                    />
                  ))}
                </div>
              ) : (
                entries[0] && (
                  <ResultRow
                    key={entries[0].option.id}
                    entry={entries[0]}
                    showCrown={entries[0].rank === 1}
                    attribution={topPickAttribution?.[entries[0].option.id]}
                    isExpanded={expandedOptionId === entries[0].option.id}
                    onToggle={
                      topPickAttribution !== undefined
                        ? () => {
                            toggleOption(entries[0]?.option.id ?? "");
                          }
                        : undefined
                    }
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
                    attribution={topPickAttribution?.[entry.option.id]}
                    isExpanded={expandedOptionId === entry.option.id}
                    onToggle={
                      topPickAttribution !== undefined
                        ? () => {
                            toggleOption(entry.option.id);
                          }
                        : undefined
                    }
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
              {reopenError && (
                <p
                  className="mt-2 text-xs text-destructive"
                  data-testid="reopen-error"
                >
                  {reopenError}
                </p>
              )}
              <button
                type="button"
                onClick={onReopen}
                disabled={isReopening}
                className="mt-3 rounded border px-3 py-1 text-xs font-medium text-blue-600 disabled:opacity-50"
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
