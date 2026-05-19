import { getDatabase } from "firebase-admin/database";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FirebasePickPublic } from "@/lib/firebase/schema/pick";

import { getPicksByGroupId } from "../picks";

vi.mock("firebase-admin/database", () => ({
  getDatabase: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminApp: vi.fn(() => "admin-app"),
}));

const getDatabaseMock = vi.mocked(getDatabase);

function makeFirebasePickPublic(
  overrides?: Partial<FirebasePickPublic>,
): FirebasePickPublic {
  return {
    title: "Best Picture",
    description: "Vote for the best movie",
    categoryId: "cat-1",
    createdAt: new Date("2025-01-01T12:00:00.000Z").getTime(),
    creatorId: "user-123",
    ...overrides,
  };
}

describe("getPicksByGroupId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("returns empty record when no category IDs are provided", () => {
    it("returns {} when categoryIds is empty", async () => {
      const result = await getPicksByGroupId([]);

      expect(result).toEqual({});
      expect(getDatabaseMock).not.toHaveBeenCalled();
    });
  });

  describe("returns picks grouped by category ID", () => {
    it("returns a record mapping each category ID to its picks", async () => {
      const cat1Pick1 = makeFirebasePickPublic({
        title: "Best Picture",
        categoryId: "cat-1",
        creatorId: "user-1",
      });
      const cat2Pick1 = makeFirebasePickPublic({
        title: "Best Score",
        categoryId: "cat-2",
        creatorId: "user-2",
      });

      const cat1Snap = {
        exists: () => true,
        val: () => ({ "pick-1": cat1Pick1 }),
      };
      const cat2Snap = {
        exists: () => true,
        val: () => ({ "pick-2": cat2Pick1 }),
      };

      getDatabaseMock.mockReturnValue({
        ref: (path: string) => {
          if (path === "categories/cat-1/picks") {
            return { get: vi.fn().mockResolvedValue(cat1Snap) };
          }
          if (path === "categories/cat-2/picks") {
            return { get: vi.fn().mockResolvedValue(cat2Snap) };
          }
          return { get: vi.fn().mockResolvedValue({ exists: () => false }) };
        },
      } as never);

      const result = await getPicksByGroupId(["cat-1", "cat-2"]);

      const cat1Picks = result["cat-1"] ?? [];
      const cat2Picks = result["cat-2"] ?? [];

      expect(Object.keys(result)).toHaveLength(2);
      expect(cat1Picks).toHaveLength(1);
      expect(cat1Picks[0]?.title).toBe("Best Picture");
      expect(cat1Picks[0]?.id).toBe("pick-1");
      expect(cat2Picks).toHaveLength(1);
      expect(cat2Picks[0]?.title).toBe("Best Score");
      expect(cat2Picks[0]?.id).toBe("pick-2");
    });

    it("returns an empty array for a category that has no picks", async () => {
      getDatabaseMock.mockReturnValue({
        ref: () => {
          return { get: vi.fn().mockResolvedValue({ exists: () => false }) };
        },
      } as never);

      const result = await getPicksByGroupId(["cat-empty"]);

      expect(result["cat-empty"]).toEqual([]);
    });
  });
});
