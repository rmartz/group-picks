import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FirebaseGroupPublic } from "@/lib/firebase/schema/group";

const { mockGet, mockSet, mockTransaction, mockUpdate, mockRef } = vi.hoisted(
  () => ({
    mockGet: vi.fn(),
    mockSet: vi.fn(),
    mockTransaction: vi.fn(),
    mockUpdate: vi.fn(),
    mockRef: vi.fn(),
  }),
);

vi.mock("@/lib/firebase/admin", () => ({
  getAdminApp: () => ({}),
  getAdminAuth: () => ({}),
}));

vi.mock("firebase-admin/database", () => ({
  getDatabase: () => ({
    ref: mockRef,
  }),
}));

const {
  getGroupsByUserId,
  markGroupActivitySeen,
  recordGroupActivity,
  removeMember,
} = await import("./groups");

function makeSnapshot<T>(value: T, exists = true) {
  return {
    exists: () => exists,
    val: () => value,
  };
}

function makeFirebaseGroupPublic(
  overrides: Partial<FirebaseGroupPublic> = {},
): FirebaseGroupPublic {
  return {
    name: "Movie Night",
    createdAt: new Date("2025-01-01T00:00:00.000Z").getTime(),
    creatorId: "user-1",
    inviteToken: "invite-123",
    ...overrides,
  };
}

describe("recordGroupActivity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRef.mockImplementation((path: string) => {
      if (path === "groups/group-1/public") {
        return { transaction: mockTransaction };
      }
      throw new Error(`Unexpected ref path: ${path}`);
    });
  });

  it("increments activityCount and stores the latest summary and timestamp", async () => {
    let capturedUpdate:
      | ((
          current: FirebaseGroupPublic | null,
        ) => FirebaseGroupPublic | undefined)
      | undefined;
    mockTransaction.mockImplementation(
      (
        update: (
          current: FirebaseGroupPublic | null,
        ) => FirebaseGroupPublic | undefined,
      ) => {
        capturedUpdate = update;
        return Promise.resolve({
          committed: true,
          snapshot: makeSnapshot(makeFirebaseGroupPublic(), true),
        });
      },
    );

    await recordGroupActivity("group-1", {
      summary: 'New pick "Inception"',
      at: new Date("2025-01-03T12:00:00.000Z"),
    });

    expect(
      capturedUpdate?.(makeFirebaseGroupPublic({ activityCount: 2 })),
    ).toEqual(
      makeFirebaseGroupPublic({
        activityCount: 3,
        lastActivity: 'New pick "Inception"',
        lastActivityAt: new Date("2025-01-03T12:00:00.000Z").getTime(),
      }),
    );
  });

  it("throws when the transaction aborts", async () => {
    mockTransaction.mockResolvedValue({
      committed: false,
      snapshot: makeSnapshot(makeFirebaseGroupPublic(), true),
    });

    await expect(
      recordGroupActivity("group-1", { summary: "Ranking submitted" }),
    ).rejects.toThrow(
      "Group public data not found or activity transaction aborted",
    );
  });
});

describe("markGroupActivitySeen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRef.mockImplementation((path: string) => {
      if (path === "groups/group-1/public/activityCount") {
        return { get: mockGet };
      }
      if (path === "users/user-1/groupSeenActivityCounts/group-1") {
        return { set: mockSet };
      }
      throw new Error(`Unexpected ref path: ${path}`);
    });
    mockSet.mockResolvedValue(undefined);
  });

  it("copies the current group activityCount to the user's seen cursor", async () => {
    mockGet.mockResolvedValue(makeSnapshot(7));

    await markGroupActivitySeen("group-1", "user-1");

    expect(mockGet).toHaveBeenCalledOnce();
    expect(mockSet).toHaveBeenCalledWith(7);
  });
});

describe("getGroupsByUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const snapshots = new Map<string, ReturnType<typeof makeSnapshot>>([
      [
        "users/user-1/groups",
        makeSnapshot({ "group-1": true, "group-2": true, "group-3": true }),
      ],
      [
        "users/user-1/groupSeenActivityCounts",
        makeSnapshot({ "group-1": 2, "group-2": 4, "group-3": 1 }),
      ],
      [
        "groups/group-1/public",
        makeSnapshot(makeFirebaseGroupPublic({ activityCount: 5 })),
      ],
      ["groups/group-1/members", makeSnapshot({ "user-1": true })],
      [
        "groups/group-2/public",
        makeSnapshot(makeFirebaseGroupPublic({ activityCount: 1 })),
      ],
      ["groups/group-2/members", makeSnapshot({ "user-1": true })],
      ["groups/group-3/public", makeSnapshot(makeFirebaseGroupPublic())],
      ["groups/group-3/members", makeSnapshot({ "user-1": true })],
    ]);
    mockRef.mockImplementation((path: string) => {
      const snapshot = snapshots.get(path);
      if (!snapshot) {
        throw new Error(`Unexpected ref path: ${path}`);
      }
      return {
        get: vi.fn().mockResolvedValue(snapshot),
      };
    });
  });

  it("derives unreadCount as max(activityCount - seenCount, 0) and defaults to 0 without activityCount", async () => {
    const groups = await getGroupsByUserId("user-1");

    expect(groups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "group-1", unreadCount: 3 }),
        expect.objectContaining({ id: "group-2", unreadCount: 0 }),
        expect.objectContaining({ id: "group-3", unreadCount: 0 }),
      ]),
    );
  });
});

describe("removeMember last-member transaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRef.mockImplementation((path: string) => {
      if (path === "groups/group-1/members") {
        return { transaction: mockTransaction };
      }
      if (path === "/") {
        return { update: mockUpdate };
      }
      throw new Error(`Unexpected ref path: ${path}`);
    });
    mockUpdate.mockResolvedValue(undefined);
  });

  it("aborts the transaction (returns undefined) when the calling user is the only member", async () => {
    let capturedUpdate:
      | ((m: Record<string, unknown> | null) => unknown)
      | undefined;
    mockTransaction.mockImplementation(
      (update: (m: Record<string, unknown> | null) => unknown) => {
        capturedUpdate = update;
        return Promise.resolve({ committed: false });
      },
    );

    await removeMember("group-1", "user-1");

    expect(capturedUpdate).toBeDefined();
    expect(capturedUpdate?.({ "user-1": true })).toBeUndefined();
  });

  it("returns members minus the calling uid when there are multiple members", async () => {
    let capturedUpdate:
      | ((m: Record<string, unknown> | null) => unknown)
      | undefined;
    mockTransaction.mockImplementation(
      (update: (m: Record<string, unknown> | null) => unknown) => {
        capturedUpdate = update;
        return Promise.resolve({ committed: true });
      },
    );

    await removeMember("group-1", "user-1");

    expect(capturedUpdate?.({ "user-1": true, "user-2": true })).toEqual({
      "user-2": true,
    });
  });

  it("aborts the transaction (returns undefined) when the snapshot is null", async () => {
    let capturedUpdate:
      | ((m: Record<string, unknown> | null) => unknown)
      | undefined;
    mockTransaction.mockImplementation(
      (update: (m: Record<string, unknown> | null) => unknown) => {
        capturedUpdate = update;
        return Promise.resolve({ committed: false });
      },
    );

    await removeMember("group-1", "user-1");

    expect(capturedUpdate?.(null)).toBeUndefined();
  });

  it("returns members map unchanged when uid is not in a single-member map", async () => {
    let capturedUpdate:
      | ((m: Record<string, unknown> | null) => unknown)
      | undefined;
    mockTransaction.mockImplementation(
      (update: (m: Record<string, unknown> | null) => unknown) => {
        capturedUpdate = update;
        return Promise.resolve({ committed: true });
      },
    );

    await removeMember("group-1", "user-1");

    expect(capturedUpdate?.({ "user-2": true })).toEqual({ "user-2": true });
  });

  it("reports lastMember=true when the transaction did not commit", async () => {
    mockTransaction.mockResolvedValue({ committed: false });

    const result = await removeMember("group-1", "user-1");

    expect(result).toEqual({ lastMember: true });
  });

  it("reports lastMember=false when the transaction committed", async () => {
    mockTransaction.mockResolvedValue({ committed: true });

    const result = await removeMember("group-1", "user-1");

    expect(result).toEqual({ lastMember: false });
  });

  it("cleans up the user-index entry after the transaction commits", async () => {
    mockTransaction.mockResolvedValue({ committed: true });

    await removeMember("group-1", "user-1");

    expect(mockUpdate).toHaveBeenCalledWith({
      "users/user-1/groups/group-1": null,
      "users/user-1/groupSeenActivityCounts/group-1": null,
    });
  });

  it("does not write a user-index cleanup when the transaction did not commit", async () => {
    mockTransaction.mockResolvedValue({ committed: false });

    await removeMember("group-1", "user-1");

    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
