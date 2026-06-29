import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetVerifiedUid,
  mockGetGroupById,
  mockGetCategoryById,
  mockCreateSnapPick,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockGetGroupById: vi.fn(),
  mockGetCategoryById: vi.fn(),
  mockCreateSnapPick: vi.fn(),
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

vi.mock("@/server/data/snap-picks", () => ({
  createSnapPick: mockCreateSnapPick,
}));

const { POST } = await import("./route");

const baseParams = { id: "group-1", categoryId: "cat-1" };

function makeRequest(body: unknown) {
  return new Request(
    "http://localhost/api/groups/group-1/categories/cat-1/snap-picks",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    },
  );
}

describe("POST /api/.../categories/[categoryId]/snap-picks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVerifiedUid.mockResolvedValue("user-1");
    mockGetGroupById.mockResolvedValue({
      id: "group-1",
      name: "G",
      createdAt: new Date(),
      creatorId: "user-1",
      memberIds: ["user-1"],
    });
    mockGetCategoryById.mockResolvedValue({
      id: "cat-1",
      groupId: "group-1",
      name: "C",
      description: "",
      createdAt: new Date(),
      creatorId: "user-1",
    });
    mockCreateSnapPick.mockResolvedValue({
      id: "snap-new",
      createdAt: new Date("2025-01-15T00:00:00Z"),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a snap pick and returns 201 with the id", async () => {
    const response = await POST(makeRequest({ title: "Lunch spot" }), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(201);
    const data = (await response.json()) as { snapPickId: string };
    expect(data.snapPickId).toBe("snap-new");
    expect(mockCreateSnapPick).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Lunch spot",
        categoryId: "cat-1",
        creatorId: "user-1",
      }),
    );
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetVerifiedUid.mockResolvedValue(undefined);

    const response = await POST(makeRequest({ title: "Lunch spot" }), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(401);
    expect(mockCreateSnapPick).not.toHaveBeenCalled();
  });

  it("returns 403 when the caller is not a group member", async () => {
    mockGetGroupById.mockResolvedValue({
      id: "group-1",
      name: "G",
      createdAt: new Date(),
      creatorId: "user-2",
      memberIds: ["user-2"],
    });

    const response = await POST(makeRequest({ title: "Lunch spot" }), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(403);
    expect(mockCreateSnapPick).not.toHaveBeenCalled();
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

    const response = await POST(makeRequest({ title: "Lunch spot" }), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(404);
    expect(mockCreateSnapPick).not.toHaveBeenCalled();
  });

  it("returns 400 when the title is missing", async () => {
    const response = await POST(makeRequest({ title: "   " }), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(400);
    expect(mockCreateSnapPick).not.toHaveBeenCalled();
  });

  it("returns 400 when defaultDurationMs is not a positive integer", async () => {
    const response = await POST(
      makeRequest({ title: "Lunch spot", defaultDurationMs: -5 }),
      { params: Promise.resolve(baseParams) },
    );

    expect(response.status).toBe(400);
    expect(mockCreateSnapPick).not.toHaveBeenCalled();
  });
});
