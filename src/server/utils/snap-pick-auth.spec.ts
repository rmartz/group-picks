import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetGroupById, mockGetCategoryById, mockGetSnapPickById } =
  vi.hoisted(() => ({
    mockGetGroupById: vi.fn(),
    mockGetCategoryById: vi.fn(),
    mockGetSnapPickById: vi.fn(),
  }));

vi.mock("@/server/data/groups", () => ({
  getGroupById: mockGetGroupById,
}));

vi.mock("@/server/data/categories", () => ({
  getCategoryById: mockGetCategoryById,
}));

vi.mock("@/server/data/snap-picks", () => ({
  getSnapPickById: mockGetSnapPickById,
}));

const { authorizeSnapPickMember } = await import("./snap-pick-auth");

beforeEach(() => {
  vi.clearAllMocks();
  mockGetGroupById.mockResolvedValue({ id: "group-1", memberIds: ["user-1"] });
  mockGetCategoryById.mockResolvedValue({ id: "cat-1", groupId: "group-1" });
  mockGetSnapPickById.mockResolvedValue({ id: "snap-1", categoryId: "cat-1" });
});

describe("authorizeSnapPickMember", () => {
  it("returns undefined when all checks pass", async () => {
    const result = await authorizeSnapPickMember(
      "user-1",
      "group-1",
      "cat-1",
      "snap-1",
    );

    expect(result).toBeUndefined();
  });

  it("returns 404 when the group does not exist", async () => {
    mockGetGroupById.mockResolvedValue(undefined);

    const result = await authorizeSnapPickMember(
      "user-1",
      "group-1",
      "cat-1",
      "snap-1",
    );

    expect(result?.status).toBe(404);
  });

  it("returns 403 when the caller is not a member", async () => {
    mockGetGroupById.mockResolvedValue({ id: "group-1", memberIds: ["other"] });

    const result = await authorizeSnapPickMember(
      "user-1",
      "group-1",
      "cat-1",
      "snap-1",
    );

    expect(result?.status).toBe(403);
  });

  it("returns 404 when the category does not belong to the group", async () => {
    mockGetCategoryById.mockResolvedValue({ id: "cat-1", groupId: "other" });

    const result = await authorizeSnapPickMember(
      "user-1",
      "group-1",
      "cat-1",
      "snap-1",
    );

    expect(result?.status).toBe(404);
  });

  it("returns 404 when the snap pick does not exist", async () => {
    mockGetSnapPickById.mockResolvedValue(undefined);

    const result = await authorizeSnapPickMember(
      "user-1",
      "group-1",
      "cat-1",
      "snap-1",
    );

    expect(result?.status).toBe(404);
  });
});
