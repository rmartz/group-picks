import { Button } from "@/components/ui/button";
import type { SnapPickOption } from "@/lib/types/snap-pick";

import { SNAP_PICK_MATCHUP_COPY } from "./SnapPickMatchup.copy";

export interface SnapPickMatchupViewProps {
  // The two options in the current matchup, or undefined when the queue is done.
  left: SnapPickOption | undefined;
  right: SnapPickOption | undefined;
  // Matchups this member has decided so far, and their total for this run.
  completed: number;
  total: number;
  // The full option pool, shown on the completion screen.
  pool: SnapPickOption[];
  loading: boolean;
  error: string | undefined;
  onChoose: (winnerId: string, loserId: string) => void;
}

export function SnapPickMatchupView({
  left,
  right,
  completed,
  total,
  pool,
  loading,
  error,
  onChoose,
}: SnapPickMatchupViewProps) {
  const hasMatchup = left !== undefined && right !== undefined;
  return (
    <div className="space-y-4">
      {total === 0 ? (
        <p className="text-sm text-muted-foreground">
          {SNAP_PICK_MATCHUP_COPY.noMatchupsMessage}
        </p>
      ) : hasMatchup ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">{SNAP_PICK_MATCHUP_COPY.prompt}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              type="button"
              onClick={() => {
                onChoose(left.id, right.id);
              }}
              disabled={loading}
              variant="outline"
              aria-label={`${SNAP_PICK_MATCHUP_COPY.chooseLabel}: ${left.title}`}
              className="h-auto min-h-24 whitespace-normal py-6 text-base font-semibold"
            >
              {left.title}
            </Button>
            <Button
              type="button"
              onClick={() => {
                onChoose(right.id, left.id);
              }}
              disabled={loading}
              variant="outline"
              aria-label={`${SNAP_PICK_MATCHUP_COPY.chooseLabel}: ${right.title}`}
              className="h-auto min-h-24 whitespace-normal py-6 text-base font-semibold"
            >
              {right.title}
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {SNAP_PICK_MATCHUP_COPY.progress(completed, total)}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-md border border-primary/40 bg-primary/5 p-3">
            <p className="text-sm font-semibold">
              {SNAP_PICK_MATCHUP_COPY.completionHeading}
            </p>
            <p className="text-xs text-muted-foreground">
              {SNAP_PICK_MATCHUP_COPY.progress(completed, total)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">
              {SNAP_PICK_MATCHUP_COPY.completionPoolHeading}
            </p>
            <ul className="mt-2 space-y-2">
              {pool.map((option) => (
                <li
                  key={option.id}
                  className="rounded-md border p-3 text-sm font-medium"
                >
                  {option.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
