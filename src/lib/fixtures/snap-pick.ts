import type { SnapPick } from "@/lib/types/snap-pick";

export function makeSnapPick(overrides?: Partial<SnapPick>): SnapPick {
  return {
    id: "snap-1",
    title: "Lunch spot",
    categoryId: "cat-1",
    createdAt: new Date("2025-03-20T08:00:00.000Z"),
    creatorId: "user-1",
    defaultDurationMs: 300000,
    ...overrides,
  };
}
