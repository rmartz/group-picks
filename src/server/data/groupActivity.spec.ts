import { getDatabase } from "firebase-admin/database";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("firebase-admin/database", () => ({
  getDatabase: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminApp: vi.fn(() => "admin-app"),
}));

const getDatabaseMock = vi.mocked(getDatabase);

const { getLastSeenAt, markGroupSeen, deriveGroupActivity, getPicksForGroup } =
  await import("./groupActivity");

const CREATED_MOVIES = new Date("2025-01-01T00:00:00.000Z").getTime();
const CREATED_MUSIC = new Date("2025-03-01T00:00:00.000Z").getTime();
const CLOSED_MUSIC = new Date("2025-04-01T00:00:00.000Z").getTime();
const LAST_SEEN = new Date("2025-02-01T00:00:00.000Z").getTime();

// Two categories, each owning a pick, nested exactly as Firebase stores them
// under `categories/{id}` — the same subtree the indexed group query returns.
const CATEGORIES_BY_GROUP = {
  "cat-1": {
    public: {
      name: "Movies",
      groupId: "group-1",
      createdAt: CREATED_MOVIES,
      creatorId: "user-1",
    },
    picks: {
      "pick-1": {
        title: "Best Picture",
        categoryId: "cat-1",
        createdAt: CREATED_MOVIES,
        creatorId: "user-1",
      },
    },
  },
  "cat-2": {
    public: {
      name: "Music",
      groupId: "group-1",
      createdAt: CREATED_MUSIC,
      creatorId: "user-1",
    },
    picks: {
      "pick-2": {
        title: "Best Album",
        categoryId: "cat-2",
        createdAt: CREATED_MUSIC,
        closedAt: CLOSED_MUSIC,
        creatorId: "user-1",
      },
    },
  },
};

// Minimal Firebase DataSnapshot stand-in supporting the read surface the data
// layer touches: exists / val / key / child / forEach.
interface MockSnapshot {
  key?: string;
  exists: () => boolean;
  val: () => unknown;
  child: (path: string) => MockSnapshot;
  forEach: (cb: (child: MockSnapshot) => boolean | undefined) => boolean;
}

function makeSnapshot(value: unknown, key?: string): MockSnapshot {
  return {
    key,
    exists: () => value !== undefined && value !== null,
    val: () => value,
    child: (path: string) =>
      makeSnapshot(
        value && typeof value === "object"
          ? (value as Record<string, unknown>)[path]
          : undefined,
        path,
      ),
    forEach: (cb) => {
      if (value && typeof value === "object") {
        for (const [childKey, childValue] of Object.entries(
          value as Record<string, unknown>,
        )) {
          if (cb(makeSnapshot(childValue, childKey)) === true) return true;
        }
      }
      return false;
    },
  };
}

interface RefRecorder {
  paths: string[];
  categoryQueries: number;
}

// Installs a getDatabase mock that records every ref path and every indexed
// categories query, so a test can assert the read *pattern*, not just outputs.
function installDatabaseMock(lastSeen?: number): RefRecorder {
  const recorder: RefRecorder = { paths: [], categoryQueries: 0 };

  getDatabaseMock.mockReturnValue({
    ref: (path: string) => {
      recorder.paths.push(path);
      return {
        orderByChild: () => ({
          equalTo: () => ({
            get: () => {
              recorder.categoryQueries += 1;
              return Promise.resolve(makeSnapshot(CATEGORIES_BY_GROUP));
            },
          }),
        }),
        get: () => Promise.resolve(makeSnapshot(lastSeen)),
      };
    },
  } as never);

  return recorder;
}

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

describe("getPicksForGroup batched read pattern", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("derives every group pick from one indexed categories query with no per-category picks read", async () => {
    const recorder = installDatabaseMock();

    await getPicksForGroup("group-1");

    expect(recorder.categoryQueries).toBe(1);
    expect(
      recorder.paths.filter((p) => /^categories\/[^/]+\/picks$/.test(p)),
    ).toEqual([]);
  });

  it("returns undefined-free picks and an empty list when the group has no categories", async () => {
    getDatabaseMock.mockReturnValue({
      ref: () => ({
        orderByChild: () => ({
          equalTo: () => ({
            get: () => Promise.resolve(makeSnapshot(undefined)),
          }),
        }),
      }),
    } as never);

    expect(await getPicksForGroup("group-1")).toEqual([]);
  });
});

describe("getPicksForGroup derived picks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns every pick nested under the group's categories", async () => {
    installDatabaseMock();

    const picks = await getPicksForGroup("group-1");

    expect(picks.map((p) => p.id).sort()).toEqual(["pick-1", "pick-2"]);
    const musicPick = picks.find((p) => p.id === "pick-2");
    expect(musicPick?.title).toBe("Best Album");
    expect(musicPick?.closedAt?.getTime()).toBe(CLOSED_MUSIC);
  });
});

describe("deriveGroupActivity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("preserves the derived preview and unread count over the batched picks", async () => {
    installDatabaseMock(LAST_SEEN);

    const result = await deriveGroupActivity("group-1", "user-1");

    // Music pick closed most recently (2025-04) → preview; only it postdates
    // the 2025-02 lastSeen → unreadCount of 1.
    expect(result.activityPreview).toBe("Closed: Best Album");
    expect(result.unreadCount).toBe(1);
  });
});
