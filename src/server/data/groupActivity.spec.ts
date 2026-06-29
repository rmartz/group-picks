import { getDatabase } from "firebase-admin/database";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RankingMode } from "@/lib/types/pick";

vi.mock("firebase-admin/database", () => ({
  getDatabase: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminApp: vi.fn(() => "admin-app"),
}));

vi.mock("./categories", () => ({
  getCategoriesByGroupId: vi.fn(),
}));

vi.mock("./picks", () => ({
  getPicksByCategory: vi.fn(),
}));

const getDatabaseMock = vi.mocked(getDatabase);

const { getCategoriesByGroupId } = await import("./categories");
const { getPicksByCategory } = await import("./picks");
const { getLastSeenAt, markGroupSeen, deriveGroupActivity } =
  await import("./groupActivity");

const getCategoriesByGroupIdMock = vi.mocked(getCategoriesByGroupId);
const getPicksByCategoryMock = vi.mocked(getPicksByCategory);

describe("getLastSeenAt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns undefined when snapshot does not exist", async () => {
    const get = vi
      .fn()
      .mockResolvedValue({ exists: () => false, val: () => null });
    getDatabaseMock.mockReturnValue({
      ref: () => ({ get }),
    } as never);

    const result = await getLastSeenAt("uid-1", "group-1");

    expect(result).toBeUndefined();
  });

  it("reads from the isolated groupLastSeenAt path (not the membership path)", async () => {
    let capturedPath: string | undefined;
    const get = vi
      .fn()
      .mockResolvedValue({ exists: () => false, val: () => null });
    getDatabaseMock.mockReturnValue({
      ref: (path: string) => {
        capturedPath = path;
        return { get };
      },
    } as never);

    await getLastSeenAt("uid-1", "group-1");

    expect(capturedPath).toBe("users/uid-1/groupLastSeenAt/group-1");
  });

  it("returns a Date when the snapshot contains a valid timestamp", async () => {
    const timestamp = new Date("2025-06-01T00:00:00.000Z").getTime();
    const get = vi
      .fn()
      .mockResolvedValue({ exists: () => true, val: () => timestamp });
    getDatabaseMock.mockReturnValue({
      ref: () => ({ get }),
    } as never);

    const result = await getLastSeenAt("uid-1", "group-1");

    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe("2025-06-01T00:00:00.000Z");
  });

  it("returns undefined when the stored value is null", async () => {
    const get = vi
      .fn()
      .mockResolvedValue({ exists: () => true, val: () => null });
    getDatabaseMock.mockReturnValue({
      ref: () => ({ get }),
    } as never);

    const result = await getLastSeenAt("uid-1", "group-1");

    expect(result).toBeUndefined();
  });

  it("returns undefined when the stored value is a non-numeric string", async () => {
    const get = vi
      .fn()
      .mockResolvedValue({ exists: () => true, val: () => "not-a-number" });
    getDatabaseMock.mockReturnValue({
      ref: () => ({ get }),
    } as never);

    const result = await getLastSeenAt("uid-1", "group-1");

    expect(result).toBeUndefined();
  });

  it("returns undefined when the stored value is NaN", async () => {
    const get = vi
      .fn()
      .mockResolvedValue({ exists: () => true, val: () => NaN });
    getDatabaseMock.mockReturnValue({
      ref: () => ({ get }),
    } as never);

    const result = await getLastSeenAt("uid-1", "group-1");

    expect(result).toBeUndefined();
  });

  it("returns undefined when the stored value is Infinity", async () => {
    const get = vi
      .fn()
      .mockResolvedValue({ exists: () => true, val: () => Infinity });
    getDatabaseMock.mockReturnValue({
      ref: () => ({ get }),
    } as never);

    const result = await getLastSeenAt("uid-1", "group-1");

    expect(result).toBeUndefined();
  });
});

describe("markGroupSeen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes to the isolated groupLastSeenAt path (not the membership path)", async () => {
    let capturedPath: string | undefined;
    const set = vi.fn().mockResolvedValue(undefined);
    getDatabaseMock.mockReturnValue({
      ref: (path: string) => {
        capturedPath = path;
        return { set };
      },
    } as never);

    await markGroupSeen("uid-1", "group-1");

    expect(capturedPath).toBe("users/uid-1/groupLastSeenAt/group-1");
  });

  it("stores the timestamp as milliseconds since epoch", async () => {
    let capturedValue: unknown;
    const set = vi.fn().mockImplementation((val: unknown) => {
      capturedValue = val;
      return Promise.resolve();
    });
    getDatabaseMock.mockReturnValue({
      ref: () => ({ set }),
    } as never);

    const seenAt = new Date("2025-06-15T10:00:00.000Z");
    await markGroupSeen("uid-1", "group-1", seenAt);

    expect(capturedValue).toBe(seenAt.getTime());
  });

  it("uses current time when no seenAt argument is provided", async () => {
    const before = Date.now();
    let capturedValue: unknown;
    const set = vi.fn().mockImplementation((val: unknown) => {
      capturedValue = val;
      return Promise.resolve();
    });
    getDatabaseMock.mockReturnValue({
      ref: () => ({ set }),
    } as never);

    await markGroupSeen("uid-1", "group-1");
    const after = Date.now();

    expect(typeof capturedValue).toBe("number");
    expect(capturedValue as number).toBeGreaterThanOrEqual(before);
    expect(capturedValue as number).toBeLessThanOrEqual(after);
  });
});

describe("deriveGroupActivity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns zero unreadCount and undefined activityPreview when there are no picks", async () => {
    const get = vi
      .fn()
      .mockResolvedValue({ exists: () => false, val: () => null });
    getDatabaseMock.mockReturnValue({
      ref: () => ({ get }),
    } as never);

    getCategoriesByGroupIdMock.mockResolvedValue([]);
    getPicksByCategoryMock.mockResolvedValue([]);

    const result = await deriveGroupActivity("group-1", "uid-1");

    expect(result.unreadCount).toBe(0);
    expect(result.activityPreview).toBeUndefined();
  });

  it("counts all picks as unread when lastSeenAt is undefined", async () => {
    const get = vi
      .fn()
      .mockResolvedValue({ exists: () => false, val: () => null });
    getDatabaseMock.mockReturnValue({
      ref: () => ({ get }),
    } as never);

    getCategoriesByGroupIdMock.mockResolvedValue([
      {
        id: "cat-1",
        name: "Movies",
        groupId: "group-1",
        createdAt: new Date(),
        creatorId: "uid-2",
      },
    ]);
    getPicksByCategoryMock.mockResolvedValue([
      {
        id: "pick-1",
        title: "Inception",
        categoryId: "cat-1",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        creatorId: "uid-2",
        topCount: 1,
        rankingMode: RankingMode.TierBuckets,
      },
      {
        id: "pick-2",
        title: "The Matrix",
        categoryId: "cat-1",
        createdAt: new Date("2025-02-01T00:00:00.000Z"),
        creatorId: "uid-2",
        topCount: 1,
        rankingMode: RankingMode.TierBuckets,
      },
    ]);

    const result = await deriveGroupActivity("group-1", "uid-1");

    expect(result.unreadCount).toBe(2);
  });
});
