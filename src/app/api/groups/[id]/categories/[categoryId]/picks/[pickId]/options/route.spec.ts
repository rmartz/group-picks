import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetVerifiedUid,
  mockGetGroupById,
  mockRecordGroupActivity,
  mockGetCategoryById,
  mockAssertPickIsOpenForWrite,
  mockGetOptionsByPick,
  mockAddOption,
  mockJoinOption,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockGetGroupById: vi.fn(),
  mockRecordGroupActivity: vi.fn(),
  mockGetCategoryById: vi.fn(),
  mockAssertPickIsOpenForWrite: vi.fn(),
  mockGetOptionsByPick: vi.fn(),
  mockAddOption: vi.fn(),
  mockJoinOption: vi.fn(),
}));

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/data/groups", () => ({
  getGroupById: mockGetGroupById,
  recordGroupActivity: mockRecordGroupActivity,
}));

vi.mock("@/server/data/categories", () => ({
  getCategoryById: mockGetCategoryById,
}));

vi.mock("@/server/data/picks", () => ({
  assertPickIsOpenForWrite: mockAssertPickIsOpenForWrite,
  getPicksByCategory: vi.fn(),
  PICK_CLOSED_API_ERROR: "Pick is closed",
  PickNotFoundError: class PickNotFoundError extends Error {
    readonly code = "pick_not_found";
    constructor() {
      super("Pick not found");
      this.name = "PickNotFoundError";
    }
  },
  PickWriteClosedError: class PickWriteClosedError extends Error {
    readonly code = "pick_closed";
    constructor(message = "Pick is closed and no longer accepts changes.") {
      super(message);
      this.name = "PickWriteClosedError";
    }
  },
}));

vi.mock("@/server/data/options", () => ({
  getOptionsByPick: mockGetOptionsByPick,
  addOption: mockAddOption,
  joinOption: mockJoinOption,
  getOptionsByCategory: vi.fn(),
}));

const { POST } = await import("./route");

const baseParams = {
  id: "group-1",
  categoryId: "cat-1",
  pickId: "pick-1",
};

function makeRequest(body: unknown) {
  return new Request(
    "http://localhost/api/groups/group-1/categories/cat-1/picks/pick-1/options",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    },
  );
}

describe("POST /api/.../picks/[pickId]/options", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVerifiedUid.mockResolvedValue("user-1");
    mockGetGroupById.mockResolvedValue({
      id: "group-1",
      name: "G",
      createdAt: new Date(),
      creatorId: "user-1",
      memberIds: ["user-1", "user-2"],
    });
    mockGetCategoryById.mockResolvedValue({
      id: "cat-1",
      groupId: "group-1",
      name: "C",
      description: "",
      createdAt: new Date(),
      creatorId: "user-1",
    });
    mockAssertPickIsOpenForWrite.mockResolvedValue({
      id: "pick-1",
      title: "P",
      categoryId: "cat-1",
      topCount: 1,
      createdAt: new Date(),
      creatorId: "user-1",
      closedAt: undefined,
    });
    mockGetOptionsByPick.mockResolvedValue([]);
    mockAddOption.mockResolvedValue({ id: "opt-new" });
    mockJoinOption.mockResolvedValue(undefined);
    mockRecordGroupActivity.mockResolvedValue(undefined);
  });

  it("creates a new option for an open pick", async () => {
    const response = await POST(makeRequest({ title: "Tacos" }), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(201);
    expect(mockAddOption).toHaveBeenCalledWith("pick-1", "Tacos", "user-1");
    expect(mockRecordGroupActivity).toHaveBeenCalledWith("group-1", {
      summary: 'Pick "P" · new option',
    });
  });

  it("returns 201 when activity recording fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    mockRecordGroupActivity.mockRejectedValue(new Error("network"));

    const response = await POST(makeRequest({ title: "Tacos" }), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(201);
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to record group activity:",
      expect.any(Error),
    );
    consoleError.mockRestore();
  });

  it("returns 404 when assertPickIsOpenForWrite throws PickNotFoundError", async () => {
    const { PickNotFoundError } = await import("@/server/data/picks");
    mockAssertPickIsOpenForWrite.mockRejectedValue(new PickNotFoundError());

    const response = await POST(makeRequest({ title: "Tacos" }), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(404);
    expect(mockAddOption).not.toHaveBeenCalled();
    expect(mockJoinOption).not.toHaveBeenCalled();
  });

  it("returns 409 when assertPickIsOpenForWrite throws PickWriteClosedError", async () => {
    const { PickWriteClosedError } = await import("@/server/data/picks");
    mockAssertPickIsOpenForWrite.mockRejectedValue(new PickWriteClosedError());

    const response = await POST(makeRequest({ title: "Tacos" }), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(409);
    expect(mockAddOption).not.toHaveBeenCalled();
    expect(mockJoinOption).not.toHaveBeenCalled();
  });

  it("rejects joining an existing option when the pick is closed", async () => {
    const { PickWriteClosedError } = await import("@/server/data/picks");
    mockAssertPickIsOpenForWrite.mockRejectedValue(new PickWriteClosedError());
    mockGetOptionsByPick.mockResolvedValue([
      { id: "opt-existing", title: "Tacos", ownerIds: ["user-2"] },
    ]);

    const response = await POST(makeRequest({ title: "Tacos" }), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(409);
    expect(mockJoinOption).not.toHaveBeenCalled();
  });

  it("calls assertPickIsOpenForWrite with categoryId and pickId", async () => {
    await POST(makeRequest({ title: "Tacos" }), {
      params: Promise.resolve(baseParams),
    });

    expect(mockAssertPickIsOpenForWrite).toHaveBeenCalledWith(
      "cat-1",
      "pick-1",
    );
  });
});
