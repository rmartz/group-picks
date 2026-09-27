"use client";

import { LOCKED_TOP_PICKS_COPY } from "./LockedTopPicks.copy";

function formatTimeRemaining(dueDate: Date, now: Date): string {
  const diffMs = dueDate.getTime() - now.getTime();
  if (diffMs <= 0) return LOCKED_TOP_PICKS_COPY.dueNow;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const { units, remainingSuffix } = LOCKED_TOP_PICKS_COPY;
  if (days >= 1) {
    return `${days.toString()} ${days === 1 ? units.day : units.days} ${remainingSuffix}`;
  }
  if (hours >= 1) {
    return `${hours.toString()} ${hours === 1 ? units.hour : units.hours} ${remainingSuffix}`;
  }
  return `${minutes.toString()} ${minutes === 1 ? units.minute : units.minutes} ${remainingSuffix}`;
}

interface LockedTopPicksProps {
  rankedCount: number;
  memberCount: number;
  dueDate?: Date;
  now?: Date;
}

export function LockedTopPicks({
  rankedCount,
  memberCount,
  dueDate,
  now = new Date(),
}: LockedTopPicksProps) {
  const copy = LOCKED_TOP_PICKS_COPY;
  const progressPercent =
    memberCount > 0 ? Math.min(100, (rankedCount / memberCount) * 100) : 0;
  const progressText = `${rankedCount.toString()} ${copy.progressConnector} ${memberCount.toString()} ${copy.progressSuffix}`;
  const countdownText =
    dueDate !== undefined
      ? `${copy.closesPrefix} ${dueDate.toLocaleString()} · ${formatTimeRemaining(dueDate, now)}`
      : copy.noDueDate;

  return (
    <div className="flex flex-col items-center gap-4 rounded-md border p-6 text-center">
      <span aria-hidden="true" className="text-5xl">
        {copy.lockIcon}
      </span>
      <p className="text-lg font-semibold">{copy.title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {copy.explanation}
      </p>

      <div className="w-full space-y-1">
        <div
          role="progressbar"
          aria-valuenow={rankedCount}
          aria-valuemin={0}
          aria-valuemax={memberCount}
          aria-valuetext={progressText}
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPercent.toString()}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{progressText}</p>
      </div>

      <p className="text-xs font-medium text-muted-foreground">
        {countdownText}
      </p>
      <p className="max-w-sm text-xs text-muted-foreground">{copy.adminNote}</p>
    </div>
  );
}
