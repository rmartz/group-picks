import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRef, mockGet, mockChild, mockUpdate } = vi.hoisted(() => ({
  mockRef: vi.fn(),
  mockGet: vi.fn(),
  mockChild: vi.fn(),
  mockUpdate: vi.fn(),
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

describe("updateSnapPickPreference", () => {
  beforeEach(() => {
    mockRef.mockReturnValue({ child: mockChild, update: mockUpdate });
    mockUpdate.mockResolvedValue(undefined);
  });

  it("applies an even matchup as a half-K Elo swing from cold-start", async () => {
    mockChild.mockReturnValue({
      get: () => Promise.resolve(snapshot(undefined)),
    });

    await updateSnapPickPreference("snap-1", "user-1", "opt-a", "opt-b");

    expect(mockRef).toHaveBeenCalledWith("snap-pick-preferences/snap-1/user-1");
    expect(mockUpdate).toHaveBeenCalledWith({
      "opt-a": { rating: 1016, games: 1 },
      "opt-b": { rating: 984, games: 1 },
    });
  });

  it("reads only the two contested options and folds their prior ratings in", async () => {
    mockChild.mockImplementation((optionId: string) => ({
      get: () =>
        Promise.resolve(
          snapshot(
            optionId === "opt-a"
              ? { rating: 1000, games: 5 }
              : { rating: 1000, games: 5 },
          ),
        ),
    }));

    await updateSnapPickPreference("snap-1", "user-1", "opt-a", "opt-b");

    expect(mockChild).toHaveBeenCalledWith("opt-a");
    expect(mockChild).toHaveBeenCalledWith("opt-b");
    expect(mockUpdate).toHaveBeenCalledWith({
      "opt-a": { rating: 1016, games: 6 },
      "opt-b": { rating: 984, games: 6 },
    });
  });
});
