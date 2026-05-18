import { beforeEach, describe, expect, it, vi } from "vitest";

import { RankingTier } from "@/lib/types/ranking";

const {
  mockGetVerifiedUid,
  mockGetGroupById,
  mockGetCategoryById,
  mockGetPickById,
  mockGetRankingByUser,
  mockSaveRanking,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockGetGroupById: vi.fn(),
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
    mockSaveRanking.mockResolvedValue(undefined);
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
