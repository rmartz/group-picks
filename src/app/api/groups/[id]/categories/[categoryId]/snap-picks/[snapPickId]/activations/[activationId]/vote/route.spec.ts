import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetVerifiedUid,
  mockAuthorizeSnapPickMember,
  mockGetOpenActivation,
  mockGetSnapPickVotes,
  mockRecordSnapPickVote,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockAuthorizeSnapPickMember: vi.fn(),
  mockGetOpenActivation: vi.fn(),
  mockGetSnapPickVotes: vi.fn(),
  mockRecordSnapPickVote: vi.fn(),
}));

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/utils/snap-pick-auth", () => ({
  authorizeSnapPickMember: mockAuthorizeSnapPickMember,
}));

vi.mock("@/server/data/snap-pick-activations", () => ({
  getOpenActivation: mockGetOpenActivation,
  getSnapPickVotes: mockGetSnapPickVotes,
  recordSnapPickVote: mockRecordSnapPickVote,
}));

const { POST } = await import("./route");

const params = Promise.resolve({
  id: "group-1",
  categoryId: "cat-1",
  snapPickId: "snap-1",
  activationId: "act-1",
});

function makeRequest(body: unknown) {
  return new Request(
    "http://localhost/api/groups/group-1/categories/cat-1/snap-picks/snap-1/activations/act-1/vote",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetVerifiedUid.mockResolvedValue("user-1");
  mockAuthorizeSnapPickMember.mockResolvedValue(undefined);
  mockGetOpenActivation.mockResolvedValue({ id: "act-1" });
  mockGetSnapPickVotes.mockResolvedValue([]);
  mockRecordSnapPickVote.mockResolvedValue({
    id: "vote-new",
    votedAt: new Date("2025-03-21T11:00:00.000Z"),
    pairKey: "opt-a_opt-b",
  });
});

describe("POST /api/.../activations/[activationId]/vote", () => {
  it("records the vote and returns 201 with the vote id", async () => {
    const response = await POST(
      makeRequest({ winnerId: "opt-a", loserId: "opt-b" }),
      { params },
    );
    const data = (await response.json()) as { voteId: string };

    expect(response.status).toBe(201);
    expect(data.voteId).toBe("vote-new");
    expect(mockRecordSnapPickVote).toHaveBeenCalledWith("act-1", {
      winnerId: "opt-a",
      loserId: "opt-b",
      votedBy: "user-1",
    });
  });

  it("returns 400 when winnerId and loserId are the same option", async () => {
    const response = await POST(
      makeRequest({ winnerId: "opt-a", loserId: "opt-a" }),
      { params },
    );

    expect(response.status).toBe(400);
    expect(mockRecordSnapPickVote).not.toHaveBeenCalled();
  });

  it("returns 409 when the activation is not the open one", async () => {
    mockGetOpenActivation.mockResolvedValue({ id: "act-other" });

    const response = await POST(
      makeRequest({ winnerId: "opt-a", loserId: "opt-b" }),
      { params },
    );

    expect(response.status).toBe(409);
    expect(mockRecordSnapPickVote).not.toHaveBeenCalled();
  });

  it("returns 409 when there is no open activation", async () => {
    mockGetOpenActivation.mockResolvedValue(undefined);

    const response = await POST(
      makeRequest({ winnerId: "opt-a", loserId: "opt-b" }),
      { params },
    );

    expect(response.status).toBe(409);
  });

  it("returns 409 when the member has already voted on the matchup", async () => {
    mockGetSnapPickVotes.mockResolvedValue([
      { votedBy: "user-1", pairKey: "opt-a_opt-b" },
    ]);

    const response = await POST(
      makeRequest({ winnerId: "opt-b", loserId: "opt-a" }),
      { params },
    );

    expect(response.status).toBe(409);
    expect(mockRecordSnapPickVote).not.toHaveBeenCalled();
  });

  it("allows a different member to vote on a pair another member decided", async () => {
    mockGetSnapPickVotes.mockResolvedValue([
      { votedBy: "user-2", pairKey: "opt-a_opt-b" },
    ]);

    const response = await POST(
      makeRequest({ winnerId: "opt-a", loserId: "opt-b" }),
      { params },
    );

    expect(response.status).toBe(201);
  });

  it("returns 403 when authorization is denied", async () => {
    const { NextResponse } = await import("next/server");
    mockAuthorizeSnapPickMember.mockResolvedValue(
      NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    );

    const response = await POST(
      makeRequest({ winnerId: "opt-a", loserId: "opt-b" }),
      { params },
    );

    expect(response.status).toBe(403);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetVerifiedUid.mockResolvedValue(undefined);

    const response = await POST(
      makeRequest({ winnerId: "opt-a", loserId: "opt-b" }),
      { params },
    );

    expect(response.status).toBe(401);
  });
});
