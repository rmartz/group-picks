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
  createSnapPick,
  getActiveSnapPickActivationsByCategories,
  getClosedActivations,
  getSnapPickActivations,
  getSnapPickById,
  getSnapPicksByCategory,
  addSnapPickOption,
  removeSnapPickOption,
  getSnapPickOptions,
  getSnapPickOptionById,
} = await import("./snap-picks");

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

describe("getClosedActivations", () => {
  const CLOSED_EARLY = {
    snapPickId: "snap-1",
    startedAt: 1_700_000_100_000,
    closesAt: 1_700_000_400_000,
    closedAt: 1_700_000_500_000,
    winnerId: "opt-a",
    startedBy: "user-2",
  };
  const CLOSED_LATE = {
    snapPickId: "snap-1",
    startedAt: 1_700_001_100_000,
    closesAt: 1_700_001_400_000,
    closedAt: 1_700_001_500_000,
    winnerId: "opt-b",
    startedBy: "user-3",
  };
  const STILL_OPEN = {
    snapPickId: "snap-1",
    startedAt: 1_700_002_100_000,
    closesAt: 1_700_002_400_000,
    startedBy: "user-4",
  };

  it("returns only closed activations, newest first by closedAt", async () => {
    mockGet.mockResolvedValue(
      snapshot({
        "act-early": CLOSED_EARLY,
        "act-open": STILL_OPEN,
        "act-late": CLOSED_LATE,
      }),
    );

    const result = await getClosedActivations("snap-1");

    expect(mockRef).toHaveBeenCalledWith("snap-pick-activations/snap-1");
    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe("act-late");
    expect(result[1]?.id).toBe("act-early");
  });

  it("returns an empty array when no activations have closed", async () => {
    mockGet.mockResolvedValue(snapshot({ "act-open": STILL_OPEN }));

    expect(await getClosedActivations("snap-1")).toEqual([]);
  });

  it("returns an empty array when the snap pick has no activations", async () => {
    mockGet.mockResolvedValue(snapshot(undefined));

    expect(await getClosedActivations("snap-1")).toEqual([]);
  });
});

describe("createSnapPick", () => {
  it("pushes a new container under snap-picks/{categoryId} and returns the id", async () => {
    mockRef.mockReturnValue({ push: mockPush });
    mockPush.mockReturnValue({ key: "snap-new", set: mockSet });
    mockSet.mockResolvedValue(undefined);

    const result = await createSnapPick({
      title: "Lunch spot",
      categoryId: "cat-9",
      creatorId: "user-3",
      defaultDurationMs: 300000,
    });

    expect(mockRef).toHaveBeenCalledWith("snap-picks/cat-9");
    expect(result.id).toBe("snap-new");
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("persists the converted snap pick to the pushed ref", async () => {
    mockRef.mockReturnValue({ push: mockPush });
    mockPush.mockReturnValue({ key: "snap-new", set: mockSet });
    mockSet.mockResolvedValue(undefined);

    await createSnapPick({
      title: "Lunch spot",
      categoryId: "cat-9",
      creatorId: "user-3",
      defaultDurationMs: 300000,
    });

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Lunch spot",
        categoryId: "cat-9",
        creatorId: "user-3",
        defaultDurationMs: 300000,
      }),
    );
  });
});

const FIREBASE_OPTION = {
  title: "Pizza",
  addedBy: "user-1",
  addedAt: 1_700_000_200_000,
};

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

describe("getActiveSnapPickActivationsByCategories", () => {
  // Routes each mocked db.ref(path).get() to a value keyed by path, so a single
  // call can resolve both the container read and its activations read.
  function routeByPath(valuesByPath: Record<string, unknown>) {
    mockRef.mockImplementation((path: string) => ({
      get: () => Promise.resolve(snapshot(valuesByPath[path])),
    }));
  }

  const now = new Date(1_700_000_500_000);

  it("returns only activations that are still open at the given time", async () => {
    routeByPath({
      "snap-picks/cat-1": { "snap-1": FIREBASE_SNAP_PICK },
      "snap-pick-activations/snap-1": {
        open: {
          snapPickId: "snap-1",
          startedAt: 1_700_000_100_000,
          closesAt: 1_700_000_600_000,
          startedBy: "user-2",
        },
        expired: {
          snapPickId: "snap-1",
          startedAt: 1_699_999_000_000,
          closesAt: 1_700_000_400_000,
          startedBy: "user-2",
        },
        closed: {
          snapPickId: "snap-1",
          startedAt: 1_700_000_100_000,
          closesAt: 1_700_000_600_000,
          closedAt: 1_700_000_450_000,
          winnerId: "option-1",
          startedBy: "user-2",
        },
      },
    });

    const result = await getActiveSnapPickActivationsByCategories(
      ["cat-1"],
      now,
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.activation.id).toBe("open");
    expect(result[0]?.snapPick.id).toBe("snap-1");
  });

  it("returns an empty array when no categories have active activations", async () => {
    routeByPath({
      "snap-picks/cat-1": undefined,
    });

    expect(
      await getActiveSnapPickActivationsByCategories(["cat-1"], now),
    ).toEqual([]);
  });
});
