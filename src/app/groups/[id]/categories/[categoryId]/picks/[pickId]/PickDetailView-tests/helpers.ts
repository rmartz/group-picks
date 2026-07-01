import type { ClosedPickResultEntry } from "@/lib/ranking-score";
import type { Option } from "@/lib/types/option";
import type { GroupPick } from "@/lib/types/pick";
import { RankingMode } from "@/lib/types/pick";

export function makeSuggestedOptionPayload(overrides?: {
  optionId?: string;
  title?: string;
}) {
  return {
    optionId: "opt-new",
    title: "New Option",
    ...overrides,
  };
}

export function makePick(overrides?: Partial<GroupPick>): GroupPick {
  return {
    id: "pick-1",
    title: "Best Movie of 2025",
    topCount: 3,
    categoryId: "cat-1",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    creatorId: "user-1",
    rankingMode: RankingMode.TierBuckets,
    ...overrides,
  };
}

export function makeOption(overrides: Partial<Option> = {}): Option {
  return {
    id: "opt-1",
    title: "Option A",
    pickId: "pick-1",
    ownerIds: ["user-1"],
    ...overrides,
  };
}

export function makeEntry(
  id: string,
  title: string,
  rank: number,
  score: number,
): ClosedPickResultEntry {
  return {
    option: { id, title, pickId: "pick-1", ownerIds: ["user-1"] },
    rank,
    score,
  };
}
