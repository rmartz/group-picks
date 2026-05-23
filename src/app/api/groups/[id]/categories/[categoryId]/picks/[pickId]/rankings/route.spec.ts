import { beforeEach, describe, expect, it, vi } from "vitest";

import { RankingTier } from "@/lib/types/ranking";

const {
  mockGetVerifiedUid,
  mockGetGroupById,
  mockRecordGroupActivity,
  mockGetCategoryById,
  mockGetPickById,
  mockGetRankingByUser,
  mockSaveRanking,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockGetGroupById: vi.fn(),
  mockRecordGroupActivity: vi.fn(),
  mockGetCategoryById: vi.fn(),
  mockGetPickById: vi.fn(),
  mockGetRankingByUser: vi.fn(),
  mockSaveRanking: vi.fn(),
}));

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/data/groups", () => ({
  getGroupById: mockGetGroupById,
  recordGroupActivity: mockRecordGroupActivity,
}));

vi.mock("@/server/data/categories", () => ({
  getCategoryById: mockGetCategoryById,
}));

vi.mock("@/server/data/picks", () => ({
  getPickById: mockGetPickById,
}));

vi.mock("@/server/data/rankings", () => ({
  getRankingByUser: mockGetRankingByUser,
  saveRanking: mockSaveRanking,
}));

const { GET, PUT } = await import("./route");

const baseParams = {
  id: "group-1",
  categoryId: "cat-1",
  pickId: "pick-1",
};

function makeGroup(overrides = {}) {
  return {
    id: "group-1",
    memberIds: ["user-1"],
    ...overrides,
  };
}

function makeCategory(overrides = {}) {
  return {
    id: "cat-1",
    groupId: "group-1",
    ...overrides,
  };
}

function makePick(overrides = {}) {
  return {
    id: "pick-1",
    title: "Best Movie",
    ...overrides,
  };
}

describe("GET /rankings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVerifiedUid.mockResolvedValue("user-1");
    mockGetGroupById.mockResolvedValue(makeGroup());
    mockGetCategoryById.mockResolvedValue(makeCategory());
    mockGetPickById.mockResolvedValue(makePick());
    mockGetRankingByUser.mockResolvedValue({});
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetVerifiedUid.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(401);
  });

  it("returns 404 when group is not found", async () => {
    mockGetGroupById.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(404);
  });

  it("returns 403 when user is not a group member", async () => {
    mockGetGroupById.mockResolvedValue(
      makeGroup({ memberIds: ["other-user"] }),
    );

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(403);
  });

  it("returns the user's rankings as JSON", async () => {
    const rankings = {
      "opt-1": RankingTier.LoveIt,
      "opt-2": RankingTier.Yes,
    };
    mockGetRankingByUser.mockResolvedValue(rankings);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ rankings });
  });
});

describe("PUT /rankings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVerifiedUid.mockResolvedValue("user-1");
    mockGetGroupById.mockResolvedValue(makeGroup());
    mockGetCategoryById.mockResolvedValue(makeCategory());
    mockGetPickById.mockResolvedValue(makePick());
    mockGetRankingByUser.mockResolvedValue({});
    mockSaveRanking.mockResolvedValue(undefined);
    mockRecordGroupActivity.mockResolvedValue(undefined);
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetVerifiedUid.mockResolvedValue(null);

    const response = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments: {} }),
      }),
      { params: Promise.resolve(baseParams) },
    );

    expect(response.status).toBe(401);
  });

  it("returns 403 when user is not a group member", async () => {
    mockGetGroupById.mockResolvedValue(
      makeGroup({ memberIds: ["other-user"] }),
    );

    const response = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments: {} }),
      }),
      { params: Promise.resolve(baseParams) },
    );

    expect(response.status).toBe(403);
  });

  it("returns 400 on invalid JSON body", async () => {
    const response = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: "not-json",
      }),
      { params: Promise.resolve(baseParams) },
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 when assignments contain an invalid tier value", async () => {
    const response = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments: { "opt-1": "invalid-tier" } }),
      }),
      { params: Promise.resolve(baseParams) },
    );

    expect(response.status).toBe(400);
    expect(mockSaveRanking).not.toHaveBeenCalled();
  });

  it("returns 200 and saves the rankings", async () => {
    const assignments = {
      "opt-1": RankingTier.LoveIt,
      "opt-2": RankingTier.Maybe,
    };

    const response = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments }),
      }),
      { params: Promise.resolve(baseParams) },
    );

    expect(response.status).toBe(200);
    expect(mockSaveRanking).toHaveBeenCalledWith(
      "pick-1",
      "user-1",
      assignments,
    );
    expect(mockGetRankingByUser).toHaveBeenCalledWith("pick-1", "user-1");
    expect(mockRecordGroupActivity).toHaveBeenCalledWith("group-1", {
      summary: "Ranking submitted · 2 options",
    });
  });

  it("does not record group activity for ranking re-submission", async () => {
    mockGetRankingByUser.mockResolvedValue({ "opt-1": RankingTier.Yes });

    const response = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments: { "opt-1": RankingTier.Maybe } }),
      }),
      { params: Promise.resolve(baseParams) },
    );

    expect(response.status).toBe(200);
    expect(mockSaveRanking).toHaveBeenCalledWith("pick-1", "user-1", {
      "opt-1": RankingTier.Maybe,
    });
    expect(mockRecordGroupActivity).not.toHaveBeenCalled();
  });

  it("returns 200 when activity recording fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    mockRecordGroupActivity.mockRejectedValue(new Error("network"));

    const response = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments: { "opt-1": RankingTier.Yes } }),
      }),
      { params: Promise.resolve(baseParams) },
    );

    expect(response.status).toBe(200);
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to record group activity:",
      expect.any(Error),
    );
    consoleError.mockRestore();
  });

  it("calls saveRanking before returning 200", async () => {
    const callOrder: string[] = [];
    mockSaveRanking.mockImplementation(() => {
      callOrder.push("saveRanking");
      return Promise.resolve();
    });

    const response = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments: { "opt-1": RankingTier.Yes } }),
      }),
      { params: Promise.resolve(baseParams) },
    );

    expect(response.status).toBe(200);
    expect(callOrder).toContain("saveRanking");
  });
});
