import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockTransaction, mockRemove, mockRef } = vi.hoisted(() => ({
  mockTransaction: vi.fn(),
  mockRemove: vi.fn(),
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

const { unjoinOption } = await import("./options");

describe("unjoinOption atomic transaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRef.mockImplementation((path: string) => {
      if (path === "picks/pick-1/options/option-1/ownerIds") {
        return { transaction: mockTransaction };
      }
      if (path === "picks/pick-1/options/option-1") {
        return { remove: mockRemove };
      }
      throw new Error(`Unexpected ref path: ${path}`);
    });
    mockRemove.mockResolvedValue(undefined);
  });

  describe("criterion 1: uses a transaction (not a read-then-write) on ownerIds", () => {
    it("calls transaction on the ownerIds ref", async () => {
      mockTransaction.mockResolvedValue({ committed: true });

      await unjoinOption("pick-1", "option-1", "user-1");

      expect(mockTransaction).toHaveBeenCalledOnce();
    });

    it("does not call get() on ownerIds (no pre-read)", async () => {
      const mockGet = vi.fn();
      mockRef.mockImplementation((path: string) => {
        if (path === "picks/pick-1/options/option-1/ownerIds") {
          return { transaction: mockTransaction, get: mockGet };
        }
        if (path === "picks/pick-1/options/option-1") {
          return { remove: mockRemove };
        }
        throw new Error(`Unexpected ref path: ${path}`);
      });
      mockTransaction.mockResolvedValue({ committed: true });

      await unjoinOption("pick-1", "option-1", "user-1");

      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe("criterion 2: transaction update fn aborts when calling uid is the only owner", () => {
    it("returns undefined when the calling uid is the sole owner", async () => {
      let capturedUpdate:
        | ((owners: Record<string, true> | null) => unknown)
        | undefined;
      mockTransaction.mockImplementation(
        (update: (owners: Record<string, true> | null) => unknown) => {
          capturedUpdate = update;
          return Promise.resolve({ committed: false });
        },
      );

      await unjoinOption("pick-1", "option-1", "user-1");

      expect(capturedUpdate?.({ "user-1": true })).toBeUndefined();
    });

    it("returns undefined when ownerIds snapshot is null", async () => {
      let capturedUpdate:
        | ((owners: Record<string, true> | null) => unknown)
        | undefined;
      mockTransaction.mockImplementation(
        (update: (owners: Record<string, true> | null) => unknown) => {
          capturedUpdate = update;
          return Promise.resolve({ committed: false });
        },
      );

      await unjoinOption("pick-1", "option-1", "user-1");

      expect(capturedUpdate?.(null)).toBeUndefined();
    });

    it("returns undefined when ownerIds snapshot is an empty object", async () => {
      let capturedUpdate:
        | ((owners: Record<string, true> | null) => unknown)
        | undefined;
      mockTransaction.mockImplementation(
        (update: (owners: Record<string, true> | null) => unknown) => {
          capturedUpdate = update;
          return Promise.resolve({ committed: false });
        },
      );

      await unjoinOption("pick-1", "option-1", "user-1");

      expect(capturedUpdate?.({})).toBeUndefined();
    });

    it("returns owners unchanged when calling uid is not in ownerIds", async () => {
      let capturedUpdate:
        | ((owners: Record<string, true> | null) => unknown)
        | undefined;
      mockTransaction.mockImplementation(
        (update: (owners: Record<string, true> | null) => unknown) => {
          capturedUpdate = update;
          return Promise.resolve({ committed: true });
        },
      );

      await unjoinOption("pick-1", "option-1", "user-1");

      const owners = { "user-2": true as const };
      expect(capturedUpdate?.(owners)).toBe(owners);
    });
  });

  describe("criterion 3: transaction update fn removes uid when other owners remain", () => {
    it("returns ownerIds minus the calling uid when multiple owners exist", async () => {
      let capturedUpdate:
        | ((owners: Record<string, true> | null) => unknown)
        | undefined;
      mockTransaction.mockImplementation(
        (update: (owners: Record<string, true> | null) => unknown) => {
          capturedUpdate = update;
          return Promise.resolve({ committed: true });
        },
      );

      await unjoinOption("pick-1", "option-1", "user-1");

      expect(capturedUpdate?.({ "user-1": true, "user-2": true })).toEqual({
        "user-2": true,
      });
    });
  });

  describe("criterion 4: deletes option and returns deleted=true when last owner unjoins", () => {
    it("removes the option node when the transaction did not commit (last owner case)", async () => {
      mockTransaction.mockResolvedValue({ committed: false });

      await unjoinOption("pick-1", "option-1", "user-1");

      expect(mockRemove).toHaveBeenCalledOnce();
    });

    it("returns { deleted: true } when the transaction did not commit", async () => {
      mockTransaction.mockResolvedValue({ committed: false });

      const result = await unjoinOption("pick-1", "option-1", "user-1");

      expect(result).toEqual({ deleted: true });
    });
  });

  describe("criterion 5: does not delete option and returns deleted=false when other owners remain", () => {
    it("does not remove the option node when the transaction committed", async () => {
      mockTransaction.mockResolvedValue({ committed: true });

      await unjoinOption("pick-1", "option-1", "user-1");

      expect(mockRemove).not.toHaveBeenCalled();
    });

    it("returns { deleted: false } when the transaction committed", async () => {
      mockTransaction.mockResolvedValue({ committed: true });

      const result = await unjoinOption("pick-1", "option-1", "user-1");

      expect(result).toEqual({ deleted: false });
    });
  });
});
