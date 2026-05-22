import { beforeEach, describe, expect, it, vi } from "vitest";

import { RankingTier } from "@/lib/types/ranking";

const { mockGet, mockRef } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockRef: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminApp: () => ({}),
}));

vi.mock("firebase-admin/database", () => ({
  getDatabase: () => ({
    ref: mockRef,
  }),
}));

const { getAllRankingsForPick, getRankingByUser, saveRanking } =
  await import("./rankings");

describe("getAllRankingsForPick", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRef.mockReturnValue({ get: mockGet });
  });

  it("returns an empty object when no snapshot exists", async () => {
    mockGet.mockResolvedValue({ exists: () => false, val: () => null });

    const result = await getAllRankingsForPick("pick-1");

    expect(result).toEqual({});
    expect(mockRef).toHaveBeenCalledWith("rankings/pick-1");
  });

  it("returns parsed rankings for valid records", async () => {
    const data = {
      "user-1": { "opt-1": RankingTier.Yes, "opt-2": RankingTier.Maybe },
      "user-2": { "opt-1": RankingTier.LoveIt },
    };
    mockGet.mockResolvedValue({ exists: () => true, val: () => data });

    const result = await getAllRankingsForPick("pick-1");

    expect(result).toEqual(data);
  });

  it("filters out records with malformed ranking values", async () => {
    const data = {
      "user-1": { "opt-1": RankingTier.Yes },
      "user-2": { "opt-1": "not_a_valid_tier" },
    };
    mockGet.mockResolvedValue({ exists: () => true, val: () => data });

    const result = await getAllRankingsForPick("pick-1");

    expect(result).toEqual({ "user-1": { "opt-1": RankingTier.Yes } });
    expect(result["user-2"]).toBeUndefined();
  });

  it("filters out non-object user records", async () => {
    const data = {
      "user-1": { "opt-1": RankingTier.Yes },
      "user-2": null,
      "user-3": "invalid",
    };
    mockGet.mockResolvedValue({ exists: () => true, val: () => data });

    const result = await getAllRankingsForPick("pick-1");

    expect(result).toEqual({ "user-1": { "opt-1": RankingTier.Yes } });
  });
});

describe("getRankingByUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRef.mockReturnValue({ get: mockGet });
  });

  it("returns an empty object when no ranking exists for the user", async () => {
    mockGet.mockResolvedValue({ exists: () => false, val: () => null });

    const result = await getRankingByUser("pick-1", "user-1");

    expect(result).toEqual({});
  });

  it("returns the stored tier assignments when they exist", async () => {
    const stored = {
      "opt-1": RankingTier.LoveIt,
      "opt-2": RankingTier.Maybe,
    };
    mockGet.mockResolvedValue({ exists: () => true, val: () => stored });

    const result = await getRankingByUser("pick-1", "user-1");

    expect(result).toEqual(stored);
  });
});

describe("saveRanking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes the tier assignments to the correct Firebase path", async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    mockRef.mockReturnValue({ update });

    const assignments = {
      "opt-1": RankingTier.Yes,
      "opt-2": RankingTier.NotReally,
    };
    await saveRanking("pick-42", "user-99", assignments);

    expect(mockRef).toHaveBeenCalledWith("/");
    expect(update).toHaveBeenCalledWith({
      "rankings/pick-42/user-99": assignments,
      "rankingsMeta/pick-42/user-99/updatedAt": expect.any(Number),
    });
  });
});
