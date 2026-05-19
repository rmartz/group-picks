import { getDatabase } from "firebase-admin/database";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FirebasePickPublic } from "@/lib/firebase/schema/pick";

import {
  assertPickIsOpenForWrite,
  closePick,
  getPickById,
  hasPicks,
  PickNotFoundError,
  PickWriteClosedError,
  updatePickIfOpen,
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

  it("throws PickNotFoundError when the transaction finds no data", async () => {
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
    ).rejects.toBeInstanceOf(PickNotFoundError);
  });
});

describe("hasPicks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when at least one pick exists", async () => {
    const get = vi.fn().mockResolvedValue({ exists: () => true });
    const limitToFirst = vi.fn().mockReturnValue({ get });

    getDatabaseMock.mockReturnValue({
      ref: () => ({ limitToFirst }),
    } as never);

    const result = await hasPicks("cat-123");

    expect(result).toBe(true);
    expect(limitToFirst).toHaveBeenCalledWith(1);
  });

  it("returns false when no picks exist", async () => {
    const get = vi.fn().mockResolvedValue({ exists: () => false });
    const limitToFirst = vi.fn().mockReturnValue({ get });

    getDatabaseMock.mockReturnValue({
      ref: () => ({ limitToFirst }),
    } as never);

    const result = await hasPicks("cat-123");

    expect(result).toBe(false);
    expect(limitToFirst).toHaveBeenCalledWith(1);
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

describe("closePick", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves when the pick exists and is open", async () => {
    const transaction = vi.fn(
      (
        update: (
          currentData: FirebasePickPublic | null,
        ) => FirebasePickPublic | undefined,
      ) => {
        const currentPick = makeFirebasePickPublic();
        const nextPick = update(currentPick);
        return {
          committed: true,
          snapshot: {
            exists: () => true,
            val: () => nextPick,
          },
        };
      },
    );

    getDatabaseMock.mockReturnValue({
      ref: () => ({ transaction }),
    } as never);

    await expect(closePick("cat-123", "pick-123")).resolves.toBeUndefined();
    expect(transaction).toHaveBeenCalledOnce();
  });

  it("throws PickWriteClosedError when the pick is already closed", async () => {
    const transaction = vi.fn(
      (
        update: (
          currentData: FirebasePickPublic | null,
        ) => FirebasePickPublic | undefined,
      ) => {
        const closedPick = makeFirebasePickPublic({
          closedAt: new Date("2025-01-18T12:00:00.000Z").getTime(),
          closedManually: true,
        });
        update(closedPick);
        return {
          committed: false,
          snapshot: {
            exists: () => true,
            val: () => closedPick,
          },
        };
      },
    );

    getDatabaseMock.mockReturnValue({
      ref: () => ({ transaction }),
    } as never);

    await expect(closePick("cat-123", "pick-123")).rejects.toBeInstanceOf(
      PickWriteClosedError,
    );
  });

  it("throws PickNotFoundError when the pick does not exist", async () => {
    const transaction = vi.fn(
      (
        update: (
          currentData: FirebasePickPublic | null,
        ) => FirebasePickPublic | undefined,
      ) => {
        update(null);
        return {
          committed: false,
          snapshot: {
            exists: () => false,
            val: () => null,
          },
        };
      },
    );

    getDatabaseMock.mockReturnValue({
      ref: () => ({ transaction }),
    } as never);

    await expect(closePick("cat-123", "pick-missing")).rejects.toBeInstanceOf(
      PickNotFoundError,
    );
  });

  it("resolves when the pick is expired (dueDate passed, no closedAt)", async () => {
    const expiredPick = makeFirebasePickPublic({
      dueDate: new Date("2025-01-01T00:00:00.000Z").getTime(),
    });
    let storedPick = expiredPick;
    const transaction = vi.fn(
      (
        update: (
          currentData: FirebasePickPublic | null,
        ) => FirebasePickPublic | undefined,
      ) => {
        const nextPick = update(storedPick);
        storedPick = nextPick ?? storedPick;
        return {
          committed: true,
          snapshot: {
            exists: () => true,
            val: () => storedPick,
          },
        };
      },
    );

    getDatabaseMock.mockReturnValue({
      ref: () => ({ transaction }),
    } as never);

    await expect(closePick("cat-123", "pick-123")).resolves.toBeUndefined();
    expect(storedPick.closedAt).toBeDefined();
    expect(storedPick.closedManually).toBeUndefined();
  });
});

describe("updatePickIfOpen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies field updates atomically when the pick is open", async () => {
    let storedPick = makeFirebasePickPublic({
      title: "Old Title",
      description: "Old desc",
      topCount: 1,
      dueDate: new Date("2025-01-20T12:00:00.000Z").getTime(),
    });
    const transaction = vi.fn(
      (
        update: (
          currentData: FirebasePickPublic | null,
        ) => FirebasePickPublic | undefined,
      ) => {
        const nextPick = update(storedPick);
        if (nextPick !== undefined) storedPick = nextPick;
        return {
          snapshot: {
            exists: () => true,
            val: () => storedPick,
          },
        };
      },
    );

    getDatabaseMock.mockReturnValue({
      ref: () => ({ transaction }),
    } as never);

    await updatePickIfOpen(
      "cat-123",
      "pick-123",
      {
        title: "New Title",
        description: "New desc",
        topCount: 3,
        dueDate: undefined,
      },
      new Date("2025-01-19T12:00:00.000Z"),
    );

    expect(storedPick.title).toBe("New Title");
    expect(storedPick.description).toBe("New desc");
    expect(storedPick.topCount).toBe(3);
    expect(storedPick.dueDate).toBeUndefined();
    expect(transaction).toHaveBeenCalledOnce();
  });

  it("clears description when an empty string is provided", async () => {
    let storedPick = makeFirebasePickPublic({ description: "Old desc" });
    const transaction = vi.fn(
      (
        update: (
          currentData: FirebasePickPublic | null,
        ) => FirebasePickPublic | undefined,
      ) => {
        const nextPick = update(storedPick);
        if (nextPick !== undefined) storedPick = nextPick;
        return {
          snapshot: {
            exists: () => true,
            val: () => storedPick,
          },
        };
      },
    );

    getDatabaseMock.mockReturnValue({
      ref: () => ({ transaction }),
    } as never);

    await updatePickIfOpen("cat-123", "pick-123", {
      title: "T",
      description: "",
      topCount: 1,
      dueDate: undefined,
    });

    expect(storedPick.description).toBeUndefined();
  });

  it("throws PickWriteClosedError without modifying when the pick is already closed", async () => {
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
      ref: () => ({ transaction }),
    } as never);

    await expect(
      updatePickIfOpen("cat-123", "pick-123", {
        title: "T",
        description: "",
        topCount: 1,
        dueDate: undefined,
      }),
    ).rejects.toMatchObject(
      new PickWriteClosedError("Pick is closed and no longer accepts changes."),
    );

    expect(storedPick.closedAt).toBe(closedAt);
    expect(storedPick.title).toBe("Best Picture");
  });

  it("atomically closes an overdue pick and throws PickWriteClosedError", async () => {
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
      ref: () => ({ transaction }),
    } as never);

    await expect(
      updatePickIfOpen(
        "cat-123",
        "pick-123",
        { title: "T", description: "", topCount: 1, dueDate: undefined },
        now,
      ),
    ).rejects.toMatchObject({
      code: "pick_closed",
      message:
        "Pick due date has passed. The pick has been closed and no longer accepts changes.",
    });

    expect(storedPick.closedAt).toBe(now.getTime());
    expect(storedPick.title).toBe("Best Picture");
  });

  it("throws PickNotFoundError when the pick does not exist", async () => {
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
      ref: () => ({ transaction }),
    } as never);

    await expect(
      updatePickIfOpen("cat-123", "pick-missing", {
        title: "T",
        description: "",
        topCount: 1,
        dueDate: undefined,
      }),
    ).rejects.toBeInstanceOf(PickNotFoundError);
  });
});
