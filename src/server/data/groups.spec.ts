import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCategoriesEqualTo,
  mockCategoriesGet,
  mockCategoriesOrderByChild,
  mockRef,
  mockTransaction,
  mockUpdate,
} = vi.hoisted(() => ({
  mockCategoriesEqualTo: vi.fn(),
  mockCategoriesGet: vi.fn(),
  mockCategoriesOrderByChild: vi.fn(),
  mockTransaction: vi.fn(),
  mockUpdate: vi.fn(),
  mockRef: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminApp: () => ({}),
  getAdminAuth: () => ({}),
}));

vi.mock("firebase-admin/database", () => ({
  getDatabase: () => ({
    ref: mockRef,
  }),
}));

const { deleteGroup, removeMember } = await import("./groups");

describe("removeMember last-member transaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRef.mockImplementation((path: string) => {
      if (path === `groups/group-1/members`) {
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
    });
  });

  it("does not write a user-index cleanup when the transaction did not commit", async () => {
    mockTransaction.mockResolvedValue({ committed: false });

    await removeMember("group-1", "user-1");

    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe("deleteGroup", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const query = {
      get: mockCategoriesGet,
    };

    mockCategoriesEqualTo.mockReturnValue(query);
    mockCategoriesOrderByChild.mockReturnValue({
      equalTo: mockCategoriesEqualTo,
    });

    mockRef.mockImplementation((path: string) => {
      if (path === "categories") {
        return {
          orderByChild: mockCategoriesOrderByChild,
        };
      }
      if (path === "/") {
        return { update: mockUpdate };
      }
      throw new Error(`Unexpected ref path: ${path}`);
    });
    mockUpdate.mockResolvedValue(undefined);
  });

  it("deletes group, invite, member indexes, and all matching categories in one update", async () => {
    mockCategoriesGet.mockResolvedValue({
      forEach: (
        callback: (child: {
          child: (path: string) => {
            val: () => Record<string, unknown> | null;
          };
          key: string | null;
        }) => void,
      ) => {
        callback({
          child: () => ({ val: () => ({ "pick-1": true, "pick-2": true }) }),
          key: "category-1",
        });
        callback({
          child: () => ({ val: () => ({ "pick-3": true }) }),
          key: "category-2",
        });
      },
    });

    await deleteGroup("group-1", ["user-1", "user-2"], "invite-token-1");

    expect(mockCategoriesOrderByChild).toHaveBeenCalledWith("public/groupId");
    expect(mockCategoriesEqualTo).toHaveBeenCalledWith("group-1");
    expect(mockUpdate).toHaveBeenCalledWith({
      "categories/category-1": null,
      "categories/category-2": null,
      "groups/group-1": null,
      "invites/invite-token-1": null,
      "picks/pick-1": null,
      "picks/pick-2": null,
      "picks/pick-3": null,
      "rankings/pick-1": null,
      "rankings/pick-2": null,
      "rankings/pick-3": null,
      "users/user-1/groups/group-1": null,
      "users/user-2/groups/group-1": null,
    });
  });

  it("still deletes group, invite, and member indexes when no categories match", async () => {
    mockCategoriesGet.mockResolvedValue({
      forEach: () => undefined,
    });

    await deleteGroup("group-1", ["user-1"], "invite-token-1");

    expect(mockUpdate).toHaveBeenCalledWith({
      "groups/group-1": null,
      "invites/invite-token-1": null,
      "users/user-1/groups/group-1": null,
    });
  });

  it("deletes categories without writing picks paths when category has no picks", async () => {
    mockCategoriesGet.mockResolvedValue({
      forEach: (
        callback: (child: {
          child: (path: string) => {
            val: () => Record<string, unknown> | null;
          };
          key: string | null;
        }) => void,
      ) => {
        callback({
          child: () => ({ val: () => null }),
          key: "category-1",
        });
      },
    });

    await deleteGroup("group-1", ["user-1"], "invite-token-1");

    expect(mockUpdate).toHaveBeenCalledWith({
      "categories/category-1": null,
      "groups/group-1": null,
      "invites/invite-token-1": null,
      "users/user-1/groups/group-1": null,
    });
  });

  it("skips categories with a null key", async () => {
    mockCategoriesGet.mockResolvedValue({
      forEach: (
        callback: (child: {
          child: (path: string) => {
            val: () => Record<string, unknown> | null;
          };
          key: string | null;
        }) => void,
      ) => {
        callback({
          child: () => ({ val: () => ({ "pick-1": true }) }),
          key: null,
        });
      },
    });

    await deleteGroup("group-1", ["user-1"], "invite-token-1");

    expect(mockUpdate).toHaveBeenCalledWith({
      "groups/group-1": null,
      "invites/invite-token-1": null,
      "users/user-1/groups/group-1": null,
    });
  });
});
