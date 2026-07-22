import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRef, mockGet, mockTransaction } = vi.hoisted(() => ({
  mockRef: vi.fn(),
  mockGet: vi.fn(),
  mockTransaction: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminApp: () => ({}),
}));

vi.mock("firebase-admin/database", () => ({
  getDatabase: () => ({ ref: mockRef }),
}));

const { getSnapPickPreferences, updateSnapPickPreference } =
  await import("./snap-pick-preferences");

function snapshot(value: unknown) {
  return {
    exists: () => value !== undefined,
    val: () => value,
  };
}

interface Rating {
  rating: number;
  games: number;
}
type Preferences = Record<string, Rating>;
type TransactionUpdate = (
  current: Preferences | null,
) => Preferences | undefined;

// Capture the read-modify-write function handed to ref.transaction() so tests
// can exercise the pure Elo computation directly, the way the concurrency-safe
// implementation runs it against whatever the node currently holds.
function captureTransactionUpdate(): () => TransactionUpdate {
  let captured: TransactionUpdate | undefined;
  mockTransaction.mockImplementation((update: TransactionUpdate) => {
    captured = update;
    return Promise.resolve({ committed: true });
  });
  return () => {
    if (!captured) throw new Error("transaction update was never captured");
    return captured;
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getSnapPickPreferences", () => {
  beforeEach(() => {
    mockRef.mockReturnValue({ get: mockGet });
  });

  it("reads and converts the user's rating vector", async () => {
    mockGet.mockResolvedValue(
      snapshot({
        "opt-a": { rating: 1200, games: 4 },
        "opt-b": { rating: 900, games: 4 },
      }),
    );

    const result = await getSnapPickPreferences("snap-1", "user-1");

    expect(mockRef).toHaveBeenCalledWith("snap-pick-preferences/snap-1/user-1");
    expect(result).toEqual({
      "opt-a": { rating: 1200, games: 4 },
      "opt-b": { rating: 900, games: 4 },
    });
  });

  it("returns an empty model when the user has no history", async () => {
    mockGet.mockResolvedValue(snapshot(undefined));

    expect(await getSnapPickPreferences("snap-1", "user-1")).toEqual({});
  });
});

describe("updateSnapPickPreference atomicity", () => {
  beforeEach(() => {
    mockRef.mockReturnValue({ transaction: mockTransaction });
  });

  it("runs a single transaction on the user's preference node", async () => {
    mockTransaction.mockResolvedValue({ committed: true });

    await updateSnapPickPreference("snap-1", "user-1", "opt-a", "opt-b");

    expect(mockRef).toHaveBeenCalledWith("snap-pick-preferences/snap-1/user-1");
    expect(mockTransaction).toHaveBeenCalledOnce();
  });
});

describe("updateSnapPickPreference Elo math", () => {
  beforeEach(() => {
    mockRef.mockReturnValue({ transaction: mockTransaction });
  });

  it("applies an even matchup as a half-K Elo swing from cold-start", async () => {
    const getUpdate = captureTransactionUpdate();

    await updateSnapPickPreference("snap-1", "user-1", "opt-a", "opt-b");

    expect(getUpdate()(null)).toEqual({
      "opt-a": { rating: 1016, games: 1 },
      "opt-b": { rating: 984, games: 1 },
    });
  });

  it("folds the two contested options' prior ratings into the swing", async () => {
    const getUpdate = captureTransactionUpdate();

    await updateSnapPickPreference("snap-1", "user-1", "opt-a", "opt-b");

    expect(
      getUpdate()({
        "opt-a": { rating: 1000, games: 5 },
        "opt-b": { rating: 1000, games: 5 },
      }),
    ).toEqual({
      "opt-a": { rating: 1016, games: 6 },
      "opt-b": { rating: 984, games: 6 },
    });
  });
});

describe("updateSnapPickPreference preservation", () => {
  beforeEach(() => {
    mockRef.mockReturnValue({ transaction: mockTransaction });
  });

  it("carries untouched options through the transaction unchanged", async () => {
    const getUpdate = captureTransactionUpdate();

    await updateSnapPickPreference("snap-1", "user-1", "opt-a", "opt-b");

    expect(
      getUpdate()({
        "opt-a": { rating: 1000, games: 0 },
        "opt-b": { rating: 1000, games: 0 },
        "opt-c": { rating: 1300, games: 9 },
      }),
    ).toEqual({
      "opt-a": { rating: 1016, games: 1 },
      "opt-b": { rating: 984, games: 1 },
      "opt-c": { rating: 1300, games: 9 },
    });
  });
});
