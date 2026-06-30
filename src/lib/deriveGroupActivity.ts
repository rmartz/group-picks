import type { GroupPick } from "@/lib/types/pick";

export function deriveActivityPreview(picks: GroupPick[]): string | undefined {
  if (picks.length === 0) return undefined;

  let mostRecent: GroupPick | undefined;
  let mostRecentTime = -Infinity;

  for (const pick of picks) {
    const eventTime = Math.max(
      pick.createdAt.getTime(),
      pick.closedAt?.getTime() ?? -Infinity,
    );
    if (eventTime > mostRecentTime) {
      mostRecentTime = eventTime;
      mostRecent = pick;
    }
  }

  if (!mostRecent) return undefined;

  if (mostRecent.closedAt !== undefined) {
    return `Closed: ${mostRecent.title}`;
  }

  return `New pick "${mostRecent.title}"`;
}

export function computeUnreadCount(
  picks: GroupPick[],
  lastSeenAt: Date | undefined,
): number {
  if (lastSeenAt === undefined) return picks.length;
  return picks.filter(
    (p) =>
      Math.max(p.createdAt.getTime(), p.closedAt?.getTime() ?? 0) >
      lastSeenAt.getTime(),
  ).length;
}
