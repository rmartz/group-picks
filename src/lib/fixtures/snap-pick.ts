import type { SnapPick, SnapPickOption } from "@/lib/types/snap-pick";

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

export function makeSnapPickOption(
  overrides?: Partial<SnapPickOption>,
): SnapPickOption {
  return {
    id: "option-1",
    title: "Pizza",
    addedBy: "user-1",
    addedAt: new Date("2025-03-21T09:00:00.000Z"),
    ...overrides,
  };
}
