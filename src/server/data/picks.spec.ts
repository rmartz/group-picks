import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDatabase } from "firebase-admin/database";
import type { FirebasePickPublic } from "@/lib/firebase/schema/pick";
import {
  assertPickIsOpenForWrite,
  getPickById,
  PickWriteClosedError,
} from "./picks";

vi.mock("firebase-admin/database", () => ({
  getDatabase: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminApp: vi.fn(() => "admin-app"),
}));

const getDatabaseMock = vi.mocked(getDatabase);

function makeFirebasePickPublic(
  overrides?: Partial<FirebasePickPublic>,
): FirebasePickPublic {
  return {
    title: "Best Picture",
    description: "Vote for the best movie",
    categoryId: "cat-123",
    createdAt: new Date("2025-01-01T12:00:00.000Z").getTime(),
    creatorId: "user-123",
    ...overrides,
  };
}

describe("assertPickIsOpenForWrite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the pick when it is still open", async () => {
    const transaction = vi.fn(
      (
        update: (
          currentData: FirebasePickPublic | null,
        ) => FirebasePickPublic | undefined,
      ) => {
        const currentPick = makeFirebasePickPublic({
          dueDate: new Date("2025-01-20T12:00:00.000Z").getTime(),
        });
        const nextPick = update(currentPick);

        return {
          snapshot: {
            exists: () => true,
            val: () => nextPick,
          },
        };
      },
    );

    getDatabaseMock.mockReturnValue({
      ref: () => ({
        transaction,
      }),
    } as never);

    const pick = await assertPickIsOpenForWrite(
      "cat-123",
      "pick-123",
      new Date("2025-01-19T12:00:00.000Z"),
    );

    expect(pick.id).toBe("pick-123");
    expect(pick.closedAt).toBeUndefined();
    expect(transaction).toHaveBeenCalledOnce();
  });

  it("atomically closes an overdue pick and rejects the write", async () => {
    const now = new Date("2025-01-21T12:00:00.000Z");
    let storedPick = makeFirebasePickPublic({
      dueDate: new Date("2025-01-20T12:00:00.000Z").getTime(),
    });
    const transaction = vi.fn(
      (
        update: (
          currentData: FirebasePickPublic | null,
        ) => FirebasePickPublic | undefined,
      ) => {
        const nextPick = update(storedPick);
        storedPick = nextPick ?? storedPick;

        return {
          snapshot: {
            exists: () => true,
            val: () => storedPick,
          },
        };
      },
    );

    getDatabaseMock.mockReturnValue({
      ref: () => ({
        transaction,
      }),
    } as never);

    await expect(
      assertPickIsOpenForWrite("cat-123", "pick-123", now),
    ).rejects.toMatchObject({
      code: "pick_closed",
      message:
        "Pick due date has passed. The pick has been closed and no longer accepts changes.",
    });

    expect(storedPick.closedAt).toBe(now.getTime());
  });

  it("rejects writes for an already closed pick without changing it", async () => {
    const closedAt = new Date("2025-01-18T12:00:00.000Z").getTime();
    let storedPick = makeFirebasePickPublic({ closedAt });
    const transaction = vi.fn(
      (
        update: (
          currentData: FirebasePickPublic | null,
        ) => FirebasePickPublic | undefined,
      ) => {
        const nextPick = update(storedPick);
        storedPick = nextPick ?? storedPick;

        return {
          snapshot: {
            exists: () => true,
            val: () => storedPick,
          },
        };
      },
    );

    getDatabaseMock.mockReturnValue({
      ref: () => ({
        transaction,
      }),
    } as never);

    await expect(
      assertPickIsOpenForWrite(
        "cat-123",
        "pick-123",
        new Date("2025-01-21T12:00:00.000Z"),
      ),
    ).rejects.toMatchObject(
      new PickWriteClosedError("Pick is closed and no longer accepts changes."),
    );

    expect(storedPick.closedAt).toBe(closedAt);
  });

  it("throws Pick not found when the transaction finds no data", async () => {
    const transaction = vi.fn(
      (
        update: (
          currentData: FirebasePickPublic | null,
        ) => FirebasePickPublic | undefined,
      ) => {
        update(null);
        return {
          snapshot: {
            exists: () => false,
            val: () => null,
          },
        };
      },
    );

    getDatabaseMock.mockReturnValue({
      ref: () => ({
        transaction,
      }),
    } as never);

    await expect(
      assertPickIsOpenForWrite("cat-123", "pick-missing"),
    ).rejects.toThrow("Pick not found");
  });
});

describe("getPickById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the pick when it exists", async () => {
    const pickData = makeFirebasePickPublic({
      title: "Best Documentary",
      categoryId: "cat-456",
      creatorId: "user-456",
    });
    const get = vi.fn().mockResolvedValue({
      exists: () => true,
      val: () => pickData,
    });

    getDatabaseMock.mockReturnValue({
      ref: () => ({ get }),
    } as never);

    const pick = await getPickById("cat-456", "pick-456");

    expect(pick).toBeDefined();
    expect(pick?.id).toBe("pick-456");
    expect(pick?.title).toBe("Best Documentary");
    expect(pick?.categoryId).toBe("cat-456");
    expect(pick?.creatorId).toBe("user-456");
  });

  it("returns undefined when the pick does not exist", async () => {
    const get = vi.fn().mockResolvedValue({
      exists: () => false,
      val: () => null,
    });

    getDatabaseMock.mockReturnValue({
      ref: () => ({ get }),
    } as never);

    const pick = await getPickById("cat-456", "pick-missing");

    expect(pick).toBeUndefined();
  });
});
