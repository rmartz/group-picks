import { describe, expect, it } from "vitest";

import { type GroupPick, RankingMode } from "@/lib/types/pick";

import {
  computeUnreadCount,
  deriveActivityPreview,
} from "./deriveGroupActivity";

function makePick(overrides?: Partial<GroupPick>): GroupPick {
  return {
    id: "pick-1",
    title: "Test Pick",
    topCount: 3,
    categoryId: "cat-1",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    creatorId: "user-1",
    rankingMode: RankingMode.TierBuckets,
    ...overrides,
  };
}

describe("deriveActivityPreview", () => {
  describe("no picks", () => {
    it("returns undefined when picks array is empty", () => {
      expect(deriveActivityPreview([])).toBeUndefined();
    });
  });

  describe("open picks", () => {
    it("returns 'New pick' prefix with pick title for an open pick", () => {
      const pick = makePick({ title: "Friday flick", closedAt: undefined });
      const result = deriveActivityPreview([pick]);
      expect(result).toContain("Friday flick");
      expect(result).toContain("New pick");
    });
  });

  describe("closed picks", () => {
    it("returns 'Closed:' prefix with pick title for a closed pick", () => {
      const pick = makePick({
        title: "Q2 read",
        closedAt: new Date("2025-06-01T00:00:00.000Z"),
      });
      const result = deriveActivityPreview([pick]);
      expect(result).toContain("Q2 read");
      expect(result).toContain("Closed:");
    });
  });

  describe("most recent event selection", () => {
    it("returns the most recently created pick when none are closed", () => {
      const older = makePick({
        id: "pick-1",
        title: "Older Pick",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
      });
      const newer = makePick({
        id: "pick-2",
        title: "Newer Pick",
        createdAt: new Date("2025-06-01T00:00:00.000Z"),
      });
      const result = deriveActivityPreview([older, newer]);
      expect(result).toContain("Newer Pick");
    });

    it("prefers a recently closed pick over an older open pick", () => {
      const openPick = makePick({
        id: "pick-1",
        title: "Open Pick",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
      });
      const closedPick = makePick({
        id: "pick-2",
        title: "Closed Pick",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        closedAt: new Date("2025-06-01T00:00:00.000Z"),
      });
      const result = deriveActivityPreview([openPick, closedPick]);
      expect(result).toContain("Closed Pick");
    });
  });
});

describe("computeUnreadCount", () => {
  describe("with no lastSeenAt", () => {
    it("counts all picks as unread when lastSeenAt is undefined", () => {
      const picks = [makePick({ id: "pick-1" }), makePick({ id: "pick-2" })];
      expect(computeUnreadCount(picks, undefined)).toBe(2);
    });

    it("returns 0 for empty picks with no lastSeenAt", () => {
      expect(computeUnreadCount([], undefined)).toBe(0);
    });
  });

  describe("with lastSeenAt", () => {
    it("counts only picks created after lastSeenAt", () => {
      const lastSeenAt = new Date("2025-03-01T00:00:00.000Z");
      const beforeSeen = makePick({
        id: "pick-1",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
      });
      const afterSeen = makePick({
        id: "pick-2",
        createdAt: new Date("2025-06-01T00:00:00.000Z"),
      });
      expect(computeUnreadCount([beforeSeen, afterSeen], lastSeenAt)).toBe(1);
    });

    it("returns 0 when all picks were seen", () => {
      const lastSeenAt = new Date("2025-12-31T00:00:00.000Z");
      const pick = makePick({
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
      });
      expect(computeUnreadCount([pick], lastSeenAt)).toBe(0);
    });

    it("does not count picks created at exactly lastSeenAt as unread", () => {
      const lastSeenAt = new Date("2025-06-01T00:00:00.000Z");
      const pick = makePick({ createdAt: lastSeenAt });
      expect(computeUnreadCount([pick], lastSeenAt)).toBe(0);
    });

    it("counts a pick closed after lastSeenAt as unread even if created before", () => {
      const lastSeenAt = new Date("2025-03-01T00:00:00.000Z");
      const pick = makePick({
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        closedAt: new Date("2025-06-01T00:00:00.000Z"),
      });
      expect(computeUnreadCount([pick], lastSeenAt)).toBe(1);
    });
  });
});
