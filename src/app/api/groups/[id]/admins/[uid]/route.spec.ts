import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetVerifiedUid, mockGetGroupById, mockRevokeAdmin } = vi.hoisted(
  () => ({
    mockGetVerifiedUid: vi.fn(),
    mockGetGroupById: vi.fn(),
    mockRevokeAdmin: vi.fn(),
  }),
);

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/data/groups", () => ({
  getGroupById: mockGetGroupById,
  revokeAdmin: mockRevokeAdmin,
}));

const { DELETE } = await import("./route");

describe("DELETE /api/groups/[id]/admins/[uid]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVerifiedUid.mockResolvedValue("creator-1");
    mockGetGroupById.mockResolvedValue({
      id: "group-1",
      name: "Weekend Plans",
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      creatorId: "creator-1",
      memberIds: ["creator-1", "admin-1"],
      adminIds: ["creator-1", "admin-1"],
      picksRestricted: false,
    });
    mockRevokeAdmin.mockResolvedValue(undefined);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetVerifiedUid.mockResolvedValue(undefined);

    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id: "group-1", uid: "admin-1" }),
    });

    expect(response.status).toBe(401);
    expect(mockRevokeAdmin).not.toHaveBeenCalled();
  });

  it("returns 404 when group is not found", async () => {
    mockGetGroupById.mockResolvedValue(undefined);

    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id: "group-1", uid: "admin-1" }),
    });

    expect(response.status).toBe(404);
    expect(mockRevokeAdmin).not.toHaveBeenCalled();
  });

  it("returns 403 when caller is not the group creator", async () => {
    mockGetVerifiedUid.mockResolvedValue("admin-1");

    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id: "group-1", uid: "admin-1" }),
    });

    expect(response.status).toBe(403);
    expect(mockRevokeAdmin).not.toHaveBeenCalled();
  });

  it("returns 403 when attempting to demote the creator", async () => {
    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id: "group-1", uid: "creator-1" }),
    });

    expect(response.status).toBe(403);
    expect(mockRevokeAdmin).not.toHaveBeenCalled();
  });

  it("returns 404 when target uid is not an admin", async () => {
    mockGetGroupById.mockResolvedValue({
      id: "group-1",
      name: "Weekend Plans",
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      creatorId: "creator-1",
      memberIds: ["creator-1", "member-1"],
      adminIds: ["creator-1"],
      picksRestricted: false,
    });

    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id: "group-1", uid: "member-1" }),
    });

    expect(response.status).toBe(404);
    expect(mockRevokeAdmin).not.toHaveBeenCalled();
  });

  it("calls revokeAdmin and returns 200 on success", async () => {
    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id: "group-1", uid: "admin-1" }),
    });

    expect(response.status).toBe(200);
    expect(mockRevokeAdmin).toHaveBeenCalledWith("group-1", "admin-1");
  });
});
