"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { SnapPickDurationChoice } from "@/lib/snap-pick-activation";
import { activateSnapPick } from "@/services/snap-picks";

import { SNAP_PICK_ACTIVATION_COPY } from "./SnapPickActivationPanel.copy";
import {
  type DurationSelection,
  SnapPickActivationPanelView,
} from "./SnapPickActivationPanelView";

interface SnapPickActivationPanelProps {
  groupId: string;
  categoryId: string;
  snapPickId: string;
  // The current run's close time when one is open; undefined when idle.
  activeClosesAt: Date | undefined;
  // Winner title of the most recent closed run, if any.
  lastWinnerTitle: string | undefined;
  hasClosedRun: boolean;
}

function toDurationChoice(
  selection: DurationSelection,
  customMinutes: string,
): SnapPickDurationChoice | undefined {
  if (selection !== "custom") {
    return { kind: "preset", preset: selection };
  }
  const minutes = Number(customMinutes);
  if (!Number.isFinite(minutes) || minutes <= 0) return undefined;
  return { kind: "custom", durationMs: minutes * 60 * 1000 };
}

export function SnapPickActivationPanel({
  groupId,
  categoryId,
  snapPickId,
  activeClosesAt,
  lastWinnerTitle,
  hasClosedRun,
}: SnapPickActivationPanelProps) {
  const router = useRouter();
  const [selection, setSelection] = useState<DurationSelection>("same-day");
  const [customMinutes, setCustomMinutes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleStart() {
    const duration = toDurationChoice(selection, customMinutes);
    if (!duration) {
      setError(SNAP_PICK_ACTIVATION_COPY.errorDefault);
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await activateSnapPick(groupId, categoryId, snapPickId, duration);
      router.refresh();
    } catch {
      setError(SNAP_PICK_ACTIVATION_COPY.errorDefault);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SnapPickActivationPanelView
      activeClosesAt={activeClosesAt}
      lastWinnerTitle={lastWinnerTitle}
      hasClosedRun={hasClosedRun}
      selection={selection}
      customMinutes={customMinutes}
      loading={loading}
      error={error}
      onSelectionChange={setSelection}
      onCustomMinutesChange={setCustomMinutes}
      onStart={() => void handleStart()}
    />
  );
}
