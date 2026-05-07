import { beforeEach, describe, expect, it, vi } from "vitest";
const {
  mockGetVerifiedUid,
  mockGetGroupById,
  mockGetCategoryById,
  mockUpdateCategory,
  mockGetPicksByCategory,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockGetGroupById: vi.fn(),
  mockGetCategoryById: vi.fn(),
  mockUpdateCategory: vi.fn(),
  mockGetPicksByCategory: vi.fn(),
}));

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/data/groups", () => ({
  getGroupById: mockGetGroupById,
}));

vi.mock("@/server/data/categories", () => ({
  getCategoryById: mockGetCategoryById,
  updateCategory: mockUpdateCategory,
}));

vi.mock("@/server/data/picks", () => ({
  getPicksByCategory: mockGetPicksByCategory,
}));

const { PATCH } = await import("./route");

function makeRequest(body: { name: string; description: string }) {
  return new Request("http://localhost/api/groups/group-1/categories/cat-1", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/groups/[id]/categories/[categoryId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetGroupById.mockResolvedValue({
      id: "group-1",
      name: "Weekend Plans",
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      creatorId: "user-1",
      memberIds: ["user-1", "user-2"],
    });
    mockGetCategoryById.mockResolvedValue({
      id: "cat-1",
      groupId: "group-1",
      name: "Original Name",
      description: "",
      createdAt: new Date("2025-01-02T00:00:00.000Z"),
      creatorId: "user-1",
    });
  });

  it("returns 403 when the requester is not the category creator", async () => {
    mockGetVerifiedUid.mockResolvedValue("user-2");

    const response = await PATCH(
      makeRequest({ name: "Updated", description: "" }),
      {
        params: Promise.resolve({ id: "group-1", categoryId: "cat-1" }),
      },
    );

    expect(response.status).toBe(403);
    expect(mockUpdateCategory).not.toHaveBeenCalled();
  });

  it("returns 409 when renaming and another member has picks in the category", async () => {
    mockGetVerifiedUid.mockResolvedValue("user-1");
    mockGetPicksByCategory.mockResolvedValue([
      {
        id: "pick-1",
        title: "A",
        categoryId: "cat-1",
        createdAt: new Date("2025-01-02T00:00:00.000Z"),
        creatorId: "user-2",
      },
    ]);

    const response = await PATCH(
      makeRequest({ name: "Updated", description: "" }),
      {
        params: Promise.resolve({ id: "group-1", categoryId: "cat-1" }),
      },
    );

    expect(response.status).toBe(409);
    expect(mockUpdateCategory).not.toHaveBeenCalled();
  });

  it("allows renaming when only the creator has picks in the category", async () => {
    mockGetVerifiedUid.mockResolvedValue("user-1");
    mockGetPicksByCategory.mockResolvedValue([
      {
        id: "pick-1",
        title: "A",
        categoryId: "cat-1",
        createdAt: new Date("2025-01-02T00:00:00.000Z"),
        creatorId: "user-1",
      },
    ]);

    const response = await PATCH(
      makeRequest({ name: "  Updated  ", description: "  Notes  " }),
      {
        params: Promise.resolve({ id: "group-1", categoryId: "cat-1" }),
      },
    );

    expect(response.status).toBe(200);
    expect(mockUpdateCategory).toHaveBeenCalledWith("cat-1", {
      name: "Updated",
      description: "Notes",
    });
  });
});
