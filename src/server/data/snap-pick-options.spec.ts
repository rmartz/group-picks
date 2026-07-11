import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGet, mockRef, mockPush, mockSet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockRef: vi.fn(),
  mockPush: vi.fn(),
  mockSet: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminApp: () => ({}),
}));

vi.mock("firebase-admin/database", () => ({
  getDatabase: () => ({
    ref: mockRef,
  }),
}));

const {
  addSnapPickOption,
  getSnapPickOptionById,
  getSnapPickOptions,
  removeSnapPickOption,
} = await import("./snap-picks");

const FIREBASE_OPTION = {
  title: "Pizza",
  addedBy: "user-1",
  addedAt: 1_700_000_200_000,
};

function snapshot(value: unknown) {
  return {
    exists: () => value !== undefined,
    val: () => value,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRef.mockReturnValue({ get: mockGet });
});

describe("addSnapPickOption", () => {
  it("pushes a new option under snap-pick-options/{snapPickId} and returns the id", async () => {
    mockRef.mockReturnValue({ push: mockPush });
    mockPush.mockReturnValue({ key: "option-new", set: mockSet });
    mockSet.mockResolvedValue(undefined);

    const result = await addSnapPickOption("snap-1", {
      title: "Pizza",
      addedBy: "user-7",
    });

    expect(mockRef).toHaveBeenCalledWith("snap-pick-options/snap-1");
    expect(result.id).toBe("option-new");
    expect(result.addedAt).toBeInstanceOf(Date);
  });

  it("persists the converted option to the pushed ref", async () => {
    mockRef.mockReturnValue({ push: mockPush });
    mockPush.mockReturnValue({ key: "option-new", set: mockSet });
    mockSet.mockResolvedValue(undefined);

    await addSnapPickOption("snap-1", { title: "Pizza", addedBy: "user-7" });

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Pizza", addedBy: "user-7" }),
    );
  });
});

describe("removeSnapPickOption", () => {
  it("soft-deletes by writing removedAt at the option's removedAt path", async () => {
    mockRef.mockReturnValue({ set: mockSet });
    mockSet.mockResolvedValue(undefined);

    const result = await removeSnapPickOption("snap-1", "option-3");

    expect(mockRef).toHaveBeenCalledWith(
      "snap-pick-options/snap-1/option-3/removedAt",
    );
    expect(mockSet).toHaveBeenCalledWith(result.removedAt.getTime());
  });
});

describe("getSnapPickOptions", () => {
  it("reads snap-pick-options/{snapPickId} and converts each active entry", async () => {
    mockGet.mockResolvedValue(snapshot({ "option-1": FIREBASE_OPTION }));

    const result = await getSnapPickOptions("snap-1");

    expect(mockRef).toHaveBeenCalledWith("snap-pick-options/snap-1");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("option-1");
    expect(result[0]?.addedAt).toEqual(new Date(1_700_000_200_000));
  });

  it("excludes soft-removed options by default", async () => {
    mockGet.mockResolvedValue(
      snapshot({
        "option-1": FIREBASE_OPTION,
        "option-2": { ...FIREBASE_OPTION, removedAt: 1_700_000_300_000 },
      }),
    );

    const result = await getSnapPickOptions("snap-1");

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("option-1");
  });

  it("includes soft-removed options when includeRemoved is true", async () => {
    mockGet.mockResolvedValue(
      snapshot({
        "option-1": FIREBASE_OPTION,
        "option-2": { ...FIREBASE_OPTION, removedAt: 1_700_000_300_000 },
      }),
    );

    const result = await getSnapPickOptions("snap-1", true);

    expect(result).toHaveLength(2);
  });

  it("returns an empty array when the snap pick has no options", async () => {
    mockGet.mockResolvedValue(snapshot(undefined));

    expect(await getSnapPickOptions("snap-1")).toEqual([]);
  });
});

describe("getSnapPickOptionById", () => {
  it("reads snap-pick-options/{snapPickId}/{optionId} and converts the snapshot", async () => {
    mockGet.mockResolvedValue(snapshot(FIREBASE_OPTION));

    const result = await getSnapPickOptionById("snap-1", "option-1");

    expect(mockRef).toHaveBeenCalledWith("snap-pick-options/snap-1/option-1");
    expect(result?.id).toBe("option-1");
    expect(result?.title).toBe("Pizza");
    expect(result?.addedBy).toBe("user-1");
    expect(result?.addedAt).toEqual(new Date(1_700_000_200_000));
  });

  it("returns undefined when the option does not exist", async () => {
    mockGet.mockResolvedValue(snapshot(undefined));

    expect(await getSnapPickOptionById("snap-1", "missing")).toBeUndefined();
  });
});
