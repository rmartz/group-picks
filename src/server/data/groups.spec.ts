import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockTransaction, mockUpdate, mockRef } = vi.hoisted(() => ({
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

const { removeMember } = await import("./groups");

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

  it("preserves the original members value when the snapshot is null (group already gone)", async () => {
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

    expect(capturedUpdate?.(null)).toBeNull();
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
