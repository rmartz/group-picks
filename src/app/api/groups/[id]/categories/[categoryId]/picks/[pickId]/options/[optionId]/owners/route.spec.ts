import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetVerifiedUid,
  mockGetGroupById,
  mockGetCategoryById,
  mockGetPickById,
  mockJoinOption,
  mockUnjoinOption,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockGetGroupById: vi.fn(),
  mockGetCategoryById: vi.fn(),
  mockGetPickById: vi.fn(),
  mockJoinOption: vi.fn(),
  mockUnjoinOption: vi.fn(),
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
  PICK_CLOSED_API_ERROR: "Pick is closed",
}));

vi.mock("@/server/data/options", () => ({
  joinOption: mockJoinOption,
  unjoinOption: mockUnjoinOption,
}));

const { POST, DELETE } = await import("./route");

const baseParams = {
  id: "group-1",
  categoryId: "cat-1",
  pickId: "pick-1",
  optionId: "opt-1",
};

function makeRequest(method: "POST" | "DELETE") {
  return new Request(
    "http://localhost/api/groups/group-1/categories/cat-1/picks/pick-1/options/opt-1/owners",
    { method },
  );
}

describe("POST /api/.../options/[optionId]/owners", () => {
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
    mockJoinOption.mockResolvedValue(undefined);
  });

  it("returns 401 when no user is signed in", async () => {
    mockGetVerifiedUid.mockResolvedValue(undefined);

    const response = await POST(makeRequest("POST"), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(401);
    expect(mockJoinOption).not.toHaveBeenCalled();
  });

  it("returns 403 when the user is not a group member", async () => {
    mockGetVerifiedUid.mockResolvedValue("user-3");

    const response = await POST(makeRequest("POST"), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(403);
    expect(mockJoinOption).not.toHaveBeenCalled();
  });

  it("returns 404 when the category does not belong to the group", async () => {
    mockGetCategoryById.mockResolvedValue({
      id: "cat-1",
      groupId: "other-group",
      name: "C",
      description: "",
      createdAt: new Date(),
      creatorId: "user-1",
    });

    const response = await POST(makeRequest("POST"), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(404);
    expect(mockJoinOption).not.toHaveBeenCalled();
  });

  it("calls joinOption with the verified uid", async () => {
    const response = await POST(makeRequest("POST"), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(200);
    expect(mockJoinOption).toHaveBeenCalledWith("pick-1", "opt-1", "user-1");
  });

  it("returns 404 when the pick does not exist", async () => {
    mockGetPickById.mockResolvedValue(undefined);

    const response = await POST(makeRequest("POST"), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(404);
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

    const response = await POST(makeRequest("POST"), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(409);
    expect(mockJoinOption).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/.../options/[optionId]/owners", () => {
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
    mockUnjoinOption.mockResolvedValue({ deleted: false });
  });

  it("returns 401 when no user is signed in", async () => {
    mockGetVerifiedUid.mockResolvedValue(undefined);

    const response = await DELETE(makeRequest("DELETE"), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(401);
    expect(mockUnjoinOption).not.toHaveBeenCalled();
  });

  it("returns 403 when the user is not a group member", async () => {
    mockGetVerifiedUid.mockResolvedValue("user-3");

    const response = await DELETE(makeRequest("DELETE"), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(403);
    expect(mockUnjoinOption).not.toHaveBeenCalled();
  });

  it("calls unjoinOption and returns the deleted flag", async () => {
    mockUnjoinOption.mockResolvedValue({ deleted: true });

    const response = await DELETE(makeRequest("DELETE"), {
      params: Promise.resolve(baseParams),
    });
    const body = (await response.json()) as { ok: true; deleted: boolean };

    expect(response.status).toBe(200);
    expect(body.deleted).toBe(true);
    expect(mockUnjoinOption).toHaveBeenCalledWith("pick-1", "opt-1", "user-1");
  });

  it("returns deleted: false when other owners remain", async () => {
    mockUnjoinOption.mockResolvedValue({ deleted: false });

    const response = await DELETE(makeRequest("DELETE"), {
      params: Promise.resolve(baseParams),
    });
    const body = (await response.json()) as { ok: true; deleted: boolean };

    expect(body.deleted).toBe(false);
  });

  it("returns 404 when the pick does not exist", async () => {
    mockGetPickById.mockResolvedValue(undefined);

    const response = await DELETE(makeRequest("DELETE"), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(404);
    expect(mockUnjoinOption).not.toHaveBeenCalled();
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

    const response = await DELETE(makeRequest("DELETE"), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(409);
    expect(mockUnjoinOption).not.toHaveBeenCalled();
  });
});
