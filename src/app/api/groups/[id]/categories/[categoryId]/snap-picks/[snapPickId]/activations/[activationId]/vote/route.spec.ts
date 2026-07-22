import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetVerifiedUid,
  mockAuthorizeSnapPickMember,
  mockGetOpenActivation,
  mockGetSnapPickVotesByMember,
  mockRecordSnapPickVote,
  mockIncrementParticipantCount,
  mockUpdateSnapPickPreference,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockAuthorizeSnapPickMember: vi.fn(),
  mockGetOpenActivation: vi.fn(),
  mockGetSnapPickVotesByMember: vi.fn(),
  mockRecordSnapPickVote: vi.fn(),
  mockIncrementParticipantCount: vi.fn(),
  mockUpdateSnapPickPreference: vi.fn(),
}));

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/utils/snap-pick-auth", () => ({
  authorizeSnapPickMember: mockAuthorizeSnapPickMember,
}));

vi.mock("@/server/data/snap-pick-activations", () => ({
  getOpenActivation: mockGetOpenActivation,
  getSnapPickVotesByMember: mockGetSnapPickVotesByMember,
  recordSnapPickVote: mockRecordSnapPickVote,
  incrementSnapPickActivationParticipantCount: mockIncrementParticipantCount,
}));

vi.mock("@/server/data/snap-pick-preferences", () => ({
  updateSnapPickPreference: mockUpdateSnapPickPreference,
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
  mockGetSnapPickVotesByMember.mockResolvedValue([]);
  mockRecordSnapPickVote.mockResolvedValue({
    id: "vote-new",
    votedAt: new Date("2025-03-21T11:00:00.000Z"),
    pairKey: "opt-a_opt-b",
  });
  mockIncrementParticipantCount.mockResolvedValue(undefined);
  mockUpdateSnapPickPreference.mockResolvedValue(undefined);
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

  it("folds the cast vote into the member's global preference model", async () => {
    await POST(makeRequest({ winnerId: "opt-a", loserId: "opt-b" }), {
      params,
    });

    expect(mockUpdateSnapPickPreference).toHaveBeenCalledWith(
      "snap-1",
      "user-1",
      "opt-a",
      "opt-b",
    );
  });

  it("returns 201 even when the preference model update throws", async () => {
    mockUpdateSnapPickPreference.mockRejectedValue(new Error("Firebase error"));

    const response = await POST(
      makeRequest({ winnerId: "opt-a", loserId: "opt-b" }),
      { params },
    );

    expect(response.status).toBe(201);
    expect(mockRecordSnapPickVote).toHaveBeenCalled();
  });

  it("increments the activation participant count on the member's first vote", async () => {
    mockGetSnapPickVotesByMember.mockResolvedValue([]);

    await POST(makeRequest({ winnerId: "opt-a", loserId: "opt-b" }), {
      params,
    });

    expect(mockIncrementParticipantCount).toHaveBeenCalledWith(
      "snap-1",
      "act-1",
    );
  });

  it("does not increment the participant count on a repeat voter's next vote", async () => {
    mockGetSnapPickVotesByMember.mockResolvedValue([
      { pairKey: "opt-c_opt-d" },
    ]);

    await POST(makeRequest({ winnerId: "opt-a", loserId: "opt-b" }), {
      params,
    });

    expect(mockIncrementParticipantCount).not.toHaveBeenCalled();
  });

  it("returns 201 even when the participant-count increment throws", async () => {
    mockIncrementParticipantCount.mockRejectedValue(
      new Error("Firebase error"),
    );

    const response = await POST(
      makeRequest({ winnerId: "opt-a", loserId: "opt-b" }),
      { params },
    );

    expect(response.status).toBe(201);
    expect(mockRecordSnapPickVote).toHaveBeenCalled();
  });

  it("does not touch the preference model when the vote is rejected", async () => {
    mockGetOpenActivation.mockResolvedValue(undefined);

    await POST(makeRequest({ winnerId: "opt-a", loserId: "opt-b" }), {
      params,
    });

    expect(mockUpdateSnapPickPreference).not.toHaveBeenCalled();
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
    mockGetSnapPickVotesByMember.mockResolvedValue([
      { pairKey: "opt-a_opt-b" },
    ]);

    const response = await POST(
      makeRequest({ winnerId: "opt-b", loserId: "opt-a" }),
      { params },
    );

    expect(response.status).toBe(409);
    expect(mockRecordSnapPickVote).not.toHaveBeenCalled();
  });

  it("scopes the duplicate-vote check to the current member's votes only", async () => {
    mockGetSnapPickVotesByMember.mockResolvedValue([]);

    const response = await POST(
      makeRequest({ winnerId: "opt-a", loserId: "opt-b" }),
      { params },
    );

    expect(response.status).toBe(201);
    expect(mockGetSnapPickVotesByMember).toHaveBeenCalledWith(
      "act-1",
      "user-1",
    );
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
