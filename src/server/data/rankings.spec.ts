import { getDatabase } from "firebase-admin/database";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RankingTier } from "@/lib/types/ranking";

import { getRankingByUser, saveRanking } from "./rankings";

vi.mock("firebase-admin/database", () => ({
  getDatabase: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminApp: vi.fn(() => "admin-app"),
}));

const getDatabaseMock = vi.mocked(getDatabase);

describe("getRankingByUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an empty object when no ranking exists for the user", async () => {
    const get = vi
      .fn()
      .mockResolvedValue({ exists: () => false, val: () => null });
    getDatabaseMock.mockReturnValue({
      ref: () => ({ get }),
    } as never);

    const result = await getRankingByUser("pick-1", "user-1");

    expect(result).toEqual({});
  });

  it("returns the stored tier assignments when they exist", async () => {
    const stored = {
      "opt-1": RankingTier.LoveIt,
      "opt-2": RankingTier.Maybe,
    };
    const get = vi
      .fn()
      .mockResolvedValue({ exists: () => true, val: () => stored });
    getDatabaseMock.mockReturnValue({
      ref: () => ({ get }),
    } as never);

    const result = await getRankingByUser("pick-1", "user-1");

    expect(result).toEqual(stored);
  });
});

describe("saveRanking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes the tier assignments to the correct Firebase path", async () => {
    const set = vi.fn().mockResolvedValue(undefined);
    const ref = vi.fn().mockReturnValue({ set });
    getDatabaseMock.mockReturnValue({ ref } as never);

    const assignments = {
      "opt-1": RankingTier.Yes,
      "opt-2": RankingTier.NotReally,
    };
    await saveRanking("pick-42", "user-99", assignments);

    expect(ref).toHaveBeenCalledWith("rankings/pick-42/user-99");
    expect(set).toHaveBeenCalledWith(assignments);
  });
});
