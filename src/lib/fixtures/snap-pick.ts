import type {
  SnapPick,
  SnapPickActivation,
  SnapPickOption,
} from "@/lib/types/snap-pick";

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

export function makeSnapPickActivation(
  overrides?: Partial<SnapPickActivation>,
): SnapPickActivation {
  return {
    id: "act-1",
    snapPickId: "snap-1",
    startedAt: new Date("2025-03-21T10:00:00.000Z"),
    closesAt: new Date("2025-03-22T00:00:00.000Z"),
    startedBy: "user-1",
    ...overrides,
  };
}
