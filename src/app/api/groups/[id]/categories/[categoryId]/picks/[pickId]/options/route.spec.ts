import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetVerifiedUid,
  mockGetGroupById,
  mockGetCategoryById,
  mockGetPickById,
  mockGetOptionsByPick,
  mockAddOption,
  mockJoinOption,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockGetGroupById: vi.fn(),
  mockGetCategoryById: vi.fn(),
  mockGetPickById: vi.fn(),
  mockGetOptionsByPick: vi.fn(),
  mockAddOption: vi.fn(),
  mockJoinOption: vi.fn(),
}));

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/data/groups", () => ({
  getGroupById: mockGetGroupById,
}));

vi.mock("@/server/data/categories", () => ({
  getCategoryById: mockGetCategoryById,
}));

vi.mock("@/server/data/picks", () => ({
  getPickById: mockGetPickById,
  getPicksByCategory: vi.fn(),
  PICK_CLOSED_API_ERROR: "Pick is closed",
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
    mockGetPickById.mockResolvedValue({
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
  });

  it("creates a new option for an open pick", async () => {
    const response = await POST(makeRequest({ title: "Tacos" }), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(201);
    expect(mockAddOption).toHaveBeenCalledWith("pick-1", "Tacos", "user-1");
  });

  it("returns 404 when the pick does not exist", async () => {
    mockGetPickById.mockResolvedValue(undefined);

    const response = await POST(makeRequest({ title: "Tacos" }), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(404);
    expect(mockAddOption).not.toHaveBeenCalled();
    expect(mockJoinOption).not.toHaveBeenCalled();
  });

  it("returns 409 when the pick is closed", async () => {
    mockGetPickById.mockResolvedValue({
      id: "pick-1",
      title: "P",
      categoryId: "cat-1",
      topCount: 1,
      createdAt: new Date(),
      creatorId: "user-1",
      closedAt: new Date(),
    });

    const response = await POST(makeRequest({ title: "Tacos" }), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(409);
    expect(mockAddOption).not.toHaveBeenCalled();
    expect(mockJoinOption).not.toHaveBeenCalled();
  });

  it("rejects joining an existing option when the pick is closed", async () => {
    mockGetPickById.mockResolvedValue({
      id: "pick-1",
      title: "P",
      categoryId: "cat-1",
      topCount: 1,
      createdAt: new Date(),
      creatorId: "user-1",
      closedAt: new Date(),
    });
    mockGetOptionsByPick.mockResolvedValue([
      { id: "opt-existing", title: "Tacos", ownerIds: ["user-2"] },
    ]);

    const response = await POST(makeRequest({ title: "Tacos" }), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(409);
    expect(mockJoinOption).not.toHaveBeenCalled();
  });
});
