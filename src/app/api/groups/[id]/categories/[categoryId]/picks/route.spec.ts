import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetVerifiedUid,
  mockGetGroupById,
  mockGetCategoryById,
  mockCreatePick,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockGetGroupById: vi.fn(),
  mockGetCategoryById: vi.fn(),
  mockCreatePick: vi.fn(),
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
  createPick: mockCreatePick,
  getPicksByCategory: vi.fn(),
}));

const { POST } = await import("./route");

const baseParams = { id: "group-1", categoryId: "cat-1" };

function makeRequest(body: unknown) {
  return new Request(
    "http://localhost/api/groups/group-1/categories/cat-1/picks",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    },
  );
}

describe("POST /api/.../categories/[categoryId]/picks", () => {
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
    mockCreatePick.mockResolvedValue({
      id: "pick-new",
      createdAt: new Date("2025-01-15T00:00:00Z"),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a pick with required fields only", async () => {
    const response = await POST(makeRequest({ title: "Best Pizza" }), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.pickId).toBe("pick-new");
    expect(mockCreatePick).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Best Pizza", topCount: 1 }),
    );
  });

  it("creates a pick with dueDate set", async () => {
    const response = await POST(
      makeRequest({ title: "Top Albums", dueDate: "2025-06-30" }),
      { params: Promise.resolve(baseParams) },
    );

    expect(response.status).toBe(201);
    expect(mockCreatePick).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Top Albums",
        dueDate: new Date("2025-06-30"),
      }),
    );
  });

  it("rejects a non-integer topCount", async () => {
    const response = await POST(
      makeRequest({ title: "Best Pizza", topCount: 1.5 }),
      { params: Promise.resolve(baseParams) },
    );

    expect(response.status).toBe(400);
    expect(mockCreatePick).not.toHaveBeenCalled();
  });

  it("rejects a zero topCount", async () => {
    const response = await POST(
      makeRequest({ title: "Best Pizza", topCount: 0 }),
      { params: Promise.resolve(baseParams) },
    );

    expect(response.status).toBe(400);
    expect(mockCreatePick).not.toHaveBeenCalled();
  });

  it("rejects a negative topCount", async () => {
    const response = await POST(
      makeRequest({ title: "Best Pizza", topCount: -3 }),
      { params: Promise.resolve(baseParams) },
    );

    expect(response.status).toBe(400);
    expect(mockCreatePick).not.toHaveBeenCalled();
  });

  it("rejects a non-numeric topCount", async () => {
    const response = await POST(
      makeRequest({ title: "Best Pizza", topCount: "three" }),
      { params: Promise.resolve(baseParams) },
    );

    expect(response.status).toBe(400);
    expect(mockCreatePick).not.toHaveBeenCalled();
  });

  it("rejects a dueDate with an invalid format", async () => {
    const response = await POST(
      makeRequest({ title: "Best Pizza", dueDate: "not-a-date" }),
      { params: Promise.resolve(baseParams) },
    );

    expect(response.status).toBe(400);
    expect(mockCreatePick).not.toHaveBeenCalled();
  });

  it("rejects a dueDate with an impossible calendar date", async () => {
    const response = await POST(
      makeRequest({ title: "Best Pizza", dueDate: "2025-02-31" }),
      { params: Promise.resolve(baseParams) },
    );

    expect(response.status).toBe(400);
    expect(mockCreatePick).not.toHaveBeenCalled();
  });

  it("omits dueDate when not provided", async () => {
    const response = await POST(makeRequest({ title: "Best Pizza" }), {
      params: Promise.resolve(baseParams),
    });

    expect(response.status).toBe(201);
    expect(mockCreatePick).toHaveBeenCalledWith(
      expect.objectContaining({ dueDate: undefined }),
    );
  });
});
