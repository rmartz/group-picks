import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockRef,
  mockGet,
  mockPush,
  mockSet,
  mockUpdate,
  mockOrderByChild,
  mockEqualTo,
  mockIncrement,
} = vi.hoisted(() => ({
  mockRef: vi.fn(),
  mockGet: vi.fn(),
  mockPush: vi.fn(),
  mockSet: vi.fn(),
  mockUpdate: vi.fn(),
  mockOrderByChild: vi.fn(),
  mockEqualTo: vi.fn(),
  mockIncrement: vi.fn(),
}));

const { mockGetSnapPickActivations, mockGetSnapPickOptions } = vi.hoisted(
  () => ({
    mockGetSnapPickActivations: vi.fn(),
    mockGetSnapPickOptions: vi.fn(),
  }),
);

vi.mock("@/lib/firebase/admin", () => ({
  getAdminApp: () => ({}),
}));

vi.mock("firebase-admin/database", () => ({
  getDatabase: () => ({ ref: mockRef }),
  ServerValue: { increment: mockIncrement },
}));

vi.mock("./snap-picks", () => ({
  getSnapPickActivations: mockGetSnapPickActivations,
  getSnapPickOptions: mockGetSnapPickOptions,
}));

const {
  createSnapPickActivation,
  closeSnapPickActivation,
  incrementSnapPickActivationParticipantCount,
  recordSnapPickVote,
  getSnapPickVotes,
  getSnapPickVotesByMember,
  getOpenActivation,
  resolveActiveActivation,
} = await import("./snap-pick-activations");

function snapshot(value: unknown) {
  return {
    exists: () => value !== undefined,
    val: () => value,
  };
}

function makeActivation(overrides?: Record<string, unknown>) {
  return {
    id: "act-1",
    snapPickId: "snap-1",
    startedAt: new Date("2025-03-20T12:00:00.000Z"),
    closesAt: new Date("2025-03-20T14:00:00.000Z"),
    startedBy: "user-1",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRef.mockReturnValue({ get: mockGet });
});

describe("createSnapPickActivation", () => {
  it("pushes an activation under snap-pick-activations/{snapPickId}", async () => {
    mockRef.mockReturnValue({ push: mockPush });
    mockPush.mockReturnValue({ key: "act-new", set: mockSet });
    mockSet.mockResolvedValue(undefined);

    const result = await createSnapPickActivation({
      snapPickId: "snap-1",
      startedAt: new Date("2025-03-20T12:00:00.000Z"),
      closesAt: new Date("2025-03-20T14:00:00.000Z"),
      startedBy: "user-1",
    });

    expect(mockRef).toHaveBeenCalledWith("snap-pick-activations/snap-1");
    expect(result.id).toBe("act-new");
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ snapPickId: "snap-1", startedBy: "user-1" }),
    );
  });
});

describe("closeSnapPickActivation", () => {
  it("updates closedAt and winnerId on the activation node", async () => {
    mockRef.mockReturnValue({ update: mockUpdate });
    mockUpdate.mockResolvedValue(undefined);

    await closeSnapPickActivation("snap-1", "act-1", {
      closedAt: new Date(1_700_000_000_000),
      winnerId: "opt-2",
    });

    expect(mockRef).toHaveBeenCalledWith("snap-pick-activations/snap-1/act-1");
    expect(mockUpdate).toHaveBeenCalledWith({
      closedAt: 1_700_000_000_000,
      winnerId: "opt-2",
    });
  });

  it("writes null winnerId when no winner was computed", async () => {
    mockRef.mockReturnValue({ update: mockUpdate });
    mockUpdate.mockResolvedValue(undefined);

    await closeSnapPickActivation("snap-1", "act-1", {
      closedAt: new Date(1_700_000_000_000),
    });

    expect(mockUpdate).toHaveBeenCalledWith({
      closedAt: 1_700_000_000_000,
      winnerId: null,
    });
  });
});

describe("recordSnapPickVote", () => {
  it("pushes a vote under snap-pick-votes/{activationId}", async () => {
    mockRef.mockReturnValue({ push: mockPush });
    mockPush.mockReturnValue({ key: "vote-new", set: mockSet });
    mockSet.mockResolvedValue(undefined);

    const result = await recordSnapPickVote("act-1", {
      winnerId: "opt-a",
      loserId: "opt-b",
      votedBy: "user-2",
    });

    expect(mockRef).toHaveBeenCalledWith("snap-pick-votes/act-1");
    expect(result.id).toBe("vote-new");
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        winnerId: "opt-a",
        loserId: "opt-b",
        votedBy: "user-2",
      }),
    );
  });
});

describe("getSnapPickVotes", () => {
  it("reads and converts votes under snap-pick-votes/{activationId}", async () => {
    mockGet.mockResolvedValue(
      snapshot({
        "vote-1": {
          winnerId: "opt-a",
          loserId: "opt-b",
          votedBy: "user-1",
          votedAt: 1_700_000_000_000,
          pairKey: "opt-a_opt-b",
        },
      }),
    );

    const result = await getSnapPickVotes("act-1");

    expect(mockRef).toHaveBeenCalledWith("snap-pick-votes/act-1");
    expect(result).toHaveLength(1);
    expect(result[0]?.winnerId).toBe("opt-a");
  });

  it("returns an empty array when there are no votes", async () => {
    mockGet.mockResolvedValue(snapshot(undefined));

    expect(await getSnapPickVotes("act-1")).toEqual([]);
  });
});

describe("incrementSnapPickActivationParticipantCount", () => {
  it("atomically increments participantCount on the activation node", async () => {
    const sentinel = { ".sv": { increment: 1 } };
    mockIncrement.mockReturnValue(sentinel);
    mockRef.mockReturnValue({ set: mockSet });
    mockSet.mockResolvedValue(undefined);

    await incrementSnapPickActivationParticipantCount("snap-1", "act-1");

    expect(mockRef).toHaveBeenCalledWith(
      "snap-pick-activations/snap-1/act-1/participantCount",
    );
    expect(mockIncrement).toHaveBeenCalledWith(1);
    expect(mockSet).toHaveBeenCalledWith(sentinel);
  });
});

describe("getSnapPickVotesByMember", () => {
  beforeEach(() => {
    mockRef.mockReturnValue({ orderByChild: mockOrderByChild });
    mockOrderByChild.mockReturnValue({ equalTo: mockEqualTo });
    mockEqualTo.mockReturnValue({ get: mockGet });
  });

  it("queries only the given member's votes at the votedBy index", async () => {
    mockGet.mockResolvedValue(
      snapshot({
        "vote-1": {
          winnerId: "opt-a",
          loserId: "opt-b",
          votedBy: "user-1",
          votedAt: 1_700_000_000_000,
          pairKey: "opt-a_opt-b",
        },
      }),
    );

    const result = await getSnapPickVotesByMember("act-1", "user-1");

    expect(mockRef).toHaveBeenCalledWith("snap-pick-votes/act-1");
    expect(mockOrderByChild).toHaveBeenCalledWith("votedBy");
    expect(mockEqualTo).toHaveBeenCalledWith("user-1");
    expect(result).toHaveLength(1);
    expect(result[0]?.pairKey).toBe("opt-a_opt-b");
  });

  it("returns an empty array when the member has cast no votes", async () => {
    mockGet.mockResolvedValue(snapshot(undefined));

    expect(await getSnapPickVotesByMember("act-1", "user-1")).toEqual([]);
  });
});

describe("getOpenActivation", () => {
  it("returns the activation that has no closedAt", async () => {
    mockGetSnapPickActivations.mockResolvedValue([
      makeActivation({ id: "act-closed", closedAt: new Date() }),
      makeActivation({ id: "act-open" }),
    ]);

    const result = await getOpenActivation("snap-1");

    expect(result?.id).toBe("act-open");
  });

  it("returns undefined when every activation is closed", async () => {
    mockGetSnapPickActivations.mockResolvedValue([
      makeActivation({ id: "act-1", closedAt: new Date() }),
    ]);

    expect(await getOpenActivation("snap-1")).toBeUndefined();
  });
});

describe("resolveActiveActivation", () => {
  it("returns the open activation unchanged when still within its window", async () => {
    const open = makeActivation({
      closesAt: new Date("2025-03-20T14:00:00.000Z"),
    });
    mockGetSnapPickActivations.mockResolvedValue([open]);

    const result = await resolveActiveActivation(
      "snap-1",
      new Date("2025-03-20T13:00:00.000Z"),
    );

    expect(result?.closedAt).toBeUndefined();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("closes the activation and records the winner once past the deadline", async () => {
    mockGetSnapPickActivations.mockResolvedValue([
      makeActivation({ closesAt: new Date("2025-03-20T14:00:00.000Z") }),
    ]);
    mockGetSnapPickOptions.mockResolvedValue([
      { id: "opt-a" },
      { id: "opt-b" },
    ]);
    mockGet.mockResolvedValue(
      snapshot({
        "vote-1": {
          winnerId: "opt-b",
          loserId: "opt-a",
          votedBy: "user-1",
          votedAt: 1_700_000_000_000,
          pairKey: "opt-a_opt-b",
        },
      }),
    );
    const updateRef = { update: mockUpdate };
    mockRef.mockImplementation((path: string) =>
      path.startsWith("snap-pick-votes") ? { get: mockGet } : updateRef,
    );
    mockUpdate.mockResolvedValue(undefined);

    const now = new Date("2025-03-20T15:00:00.000Z");
    const result = await resolveActiveActivation("snap-1", now);

    expect(result?.closedAt).toEqual(now);
    expect(result?.winnerId).toBe("opt-b");
    expect(mockUpdate).toHaveBeenCalledWith({
      closedAt: now.getTime(),
      winnerId: "opt-b",
    });
  });

  it("returns undefined when there is no open activation", async () => {
    mockGetSnapPickActivations.mockResolvedValue([]);

    expect(await resolveActiveActivation("snap-1")).toBeUndefined();
  });
});
