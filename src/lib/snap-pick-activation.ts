// Pure activation lifecycle logic for Snap Picks: computing when an activation
// closes from a chosen duration, and computing the winning option from the
// head-to-head votes cast during the run. Kept free of Firebase so it can be
// unit-tested in isolation and reused by both the data layer and the API route.

import type { SnapPickVote } from "@/lib/types/snap-pick";

// Named preset durations offered on activation start. "same-day" closes at the
// next midnight (local time); the fixed presets add a span from the start time.
export const SNAP_PICK_DURATION_PRESETS = [
  "same-day",
  "1-hour",
  "2-hours",
  "4-hours",
] as const;

export type SnapPickDurationPreset =
  (typeof SNAP_PICK_DURATION_PRESETS)[number];

const HOUR_MS = 60 * 60 * 1000;

const PRESET_SPAN_MS: Record<
  Exclude<SnapPickDurationPreset, "same-day">,
  number
> = {
  "1-hour": HOUR_MS,
  "2-hours": 2 * HOUR_MS,
  "4-hours": 4 * HOUR_MS,
};

// A duration choice is either a named preset or an explicit custom span in ms.
export type SnapPickDurationChoice =
  | { kind: "preset"; preset: SnapPickDurationPreset }
  | { kind: "custom"; durationMs: number };

// Resolves the close time for an activation started at `startedAt`. "same-day"
// resolves to the upcoming local midnight; presets and custom spans add to the
// start time.
export function computeClosesAt(
  startedAt: Date,
  choice: SnapPickDurationChoice,
): Date {
  if (choice.kind === "custom") {
    return new Date(startedAt.getTime() + choice.durationMs);
  }

  if (choice.preset === "same-day") {
    const midnight = new Date(startedAt);
    midnight.setHours(24, 0, 0, 0);
    return midnight;
  }

  return new Date(startedAt.getTime() + PRESET_SPAN_MS[choice.preset]);
}

export function isDurationPreset(
  value: string,
): value is SnapPickDurationPreset {
  return (SNAP_PICK_DURATION_PRESETS as readonly string[]).includes(value);
}

// True once the activation's close time has passed relative to `now`. Drives the
// lazy auto-close: the first request made after this flips true closes the run.
export function isPastDeadline(closesAt: Date, now: Date): boolean {
  return now.getTime() >= closesAt.getTime();
}

// Tallies head-to-head wins per option and returns the option id with the most
// wins. `optionIds` establishes a stable order used to break ties (earliest
// option wins) and to keep the result deterministic. Returns undefined when
// there are no votes and no options to fall back on.
export function computeSnapPickWinner(
  votes: SnapPickVote[],
  optionIds: string[],
): string | undefined {
  // Preserve option order for deterministic tie-breaking: options not present in
  // `optionIds` (e.g. removed after voting) are appended in first-seen vote order.
  const orderedIds = [...optionIds];
  const seen = new Set(optionIds);
  for (const vote of votes) {
    if (!seen.has(vote.winnerId)) {
      seen.add(vote.winnerId);
      orderedIds.push(vote.winnerId);
    }
  }

  const winCounts = new Map<string, number>();
  for (const id of orderedIds) {
    winCounts.set(id, 0);
  }
  for (const vote of votes) {
    winCounts.set(vote.winnerId, (winCounts.get(vote.winnerId) ?? 0) + 1);
  }

  let winnerId: string | undefined;
  let bestCount = -1;
  for (const id of orderedIds) {
    const count = winCounts.get(id) ?? 0;
    if (count > bestCount) {
      bestCount = count;
      winnerId = id;
    }
  }

  return winnerId;
}
