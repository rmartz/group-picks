import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SNAP_PICK_DURATION_PRESETS,
  type SnapPickDurationPreset,
} from "@/lib/snap-pick-activation";

import { SNAP_PICK_ACTIVATION_COPY } from "./SnapPickActivationPanel.copy";

// The duration dropdown offers each preset plus a "custom" sentinel that reveals
// a minutes input.
export type DurationSelection = SnapPickDurationPreset | "custom";

const DURATION_SELECTIONS: DurationSelection[] = [
  ...SNAP_PICK_DURATION_PRESETS,
  "custom",
];

export interface SnapPickActivationPanelViewProps {
  // Absent when no activation is running; the run's close time when open.
  activeClosesAt: Date | undefined;
  // The winner's title from the most recent closed run, if any.
  lastWinnerTitle: string | undefined;
  // True once the most recent run has closed (so a winner section can render).
  hasClosedRun: boolean;
  selection: DurationSelection;
  customMinutes: string;
  loading: boolean;
  error: string | undefined;
  onSelectionChange: (selection: DurationSelection) => void;
  onCustomMinutesChange: (minutes: string) => void;
  onStart: () => void;
}

export function SnapPickActivationPanelView({
  activeClosesAt,
  lastWinnerTitle,
  hasClosedRun,
  selection,
  customMinutes,
  loading,
  error,
  onSelectionChange,
  onCustomMinutesChange,
  onStart,
}: SnapPickActivationPanelViewProps) {
  return (
    <div className="space-y-4">
      {activeClosesAt ? (
        <div className="rounded-md border p-3">
          <p className="text-sm font-medium">
            {SNAP_PICK_ACTIVATION_COPY.inProgressHeading}
          </p>
          <p className="text-sm text-muted-foreground">
            {SNAP_PICK_ACTIVATION_COPY.closesAtPrefix}{" "}
            {activeClosesAt.toLocaleString()}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {hasClosedRun && (
            <div className="rounded-md border border-primary/40 bg-primary/5 p-3">
              <p className="text-sm font-semibold">
                {SNAP_PICK_ACTIVATION_COPY.winnerHeading}
              </p>
              <p className="text-lg font-bold">
                {lastWinnerTitle ?? SNAP_PICK_ACTIVATION_COPY.noWinnerMessage}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="snap-pick-duration">
              {SNAP_PICK_ACTIVATION_COPY.durationLabel}
            </Label>
            <select
              id="snap-pick-duration"
              value={selection}
              onChange={(e) => {
                onSelectionChange(e.target.value as DurationSelection);
              }}
              disabled={loading}
              className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
            >
              {DURATION_SELECTIONS.map((value) => (
                <option key={value} value={value}>
                  {SNAP_PICK_ACTIVATION_COPY.durationOptions[value]}
                </option>
              ))}
            </select>
          </div>

          {selection === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="snap-pick-custom-minutes">
                {SNAP_PICK_ACTIVATION_COPY.customLabel}
              </Label>
              <Input
                id="snap-pick-custom-minutes"
                type="number"
                min={1}
                value={customMinutes}
                onChange={(e) => {
                  onCustomMinutesChange(e.target.value);
                }}
                disabled={loading}
              />
            </div>
          )}

          <Button
            type="button"
            onClick={onStart}
            disabled={loading}
            variant="default"
          >
            {SNAP_PICK_ACTIVATION_COPY.startButton}
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
