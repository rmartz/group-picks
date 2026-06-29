import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGet, mockRef } = vi.hoisted(() => ({
  mockGet: vi.fn(),
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

const { getSnapPickById, getSnapPicksByCategory, getSnapPickActivations } =
  await import("./snap-picks");

function snapshot(value: unknown) {
  return {
    exists: () => value !== undefined,
    val: () => value,
  };
}

const FIREBASE_SNAP_PICK = {
  title: "Lunch spot",
  categoryId: "cat-1",
  createdAt: 1_700_000_000_000,
  creatorId: "user-1",
  defaultDurationMs: 300000,
};

const FIREBASE_ACTIVATION = {
  snapPickId: "snap-1",
  startedAt: 1_700_000_100_000,
  closesAt: 1_700_000_400_000,
  startedBy: "user-2",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockRef.mockReturnValue({ get: mockGet });
});

describe("getSnapPickById", () => {
  it("reads snap-picks/{categoryId}/{snapPickId} and converts the snapshot", async () => {
    mockGet.mockResolvedValue(snapshot(FIREBASE_SNAP_PICK));

    const result = await getSnapPickById("cat-1", "snap-1");

    expect(mockRef).toHaveBeenCalledWith("snap-picks/cat-1/snap-1");
    expect(result?.id).toBe("snap-1");
    expect(result?.title).toBe("Lunch spot");
    expect(result?.createdAt).toEqual(new Date(1_700_000_000_000));
  });

  it("returns undefined when the snap pick does not exist", async () => {
    mockGet.mockResolvedValue(snapshot(undefined));

    expect(await getSnapPickById("cat-1", "missing")).toBeUndefined();
  });
});

describe("getSnapPicksByCategory", () => {
  it("reads snap-picks/{categoryId} and converts each entry to a SnapPick", async () => {
    mockGet.mockResolvedValue(snapshot({ "snap-1": FIREBASE_SNAP_PICK }));

    const result = await getSnapPicksByCategory("cat-1");

    expect(mockRef).toHaveBeenCalledWith("snap-picks/cat-1");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("snap-1");
  });

  it("returns an empty array when the category has no snap picks", async () => {
    mockGet.mockResolvedValue(snapshot(undefined));

    expect(await getSnapPicksByCategory("cat-1")).toEqual([]);
  });
});

describe("getSnapPickActivations", () => {
  it("reads snap-pick-activations/{snapPickId} and converts each entry", async () => {
    mockGet.mockResolvedValue(snapshot({ "act-1": FIREBASE_ACTIVATION }));

    const result = await getSnapPickActivations("snap-1");

    expect(mockRef).toHaveBeenCalledWith("snap-pick-activations/snap-1");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("act-1");
    expect(result[0]?.startedAt).toEqual(new Date(1_700_000_100_000));
  });

  it("returns an empty array when the snap pick has no activations", async () => {
    mockGet.mockResolvedValue(snapshot(undefined));

    expect(await getSnapPickActivations("snap-1")).toEqual([]);
  });
});
