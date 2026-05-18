import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetVerifiedUid, mockGetGroupById, mockPromoteAdmin } = vi.hoisted(
  () => ({
    mockGetVerifiedUid: vi.fn(),
    mockGetGroupById: vi.fn(),
    mockPromoteAdmin: vi.fn(),
  }),
);

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/data/groups", () => ({
  getGroupById: mockGetGroupById,
  promoteAdmin: mockPromoteAdmin,
}));

const { POST } = await import("./route");

function makeRequest(body: { uid: string }) {
  return new Request("http://localhost/api/groups/group-1/admins", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/groups/[id]/admins", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVerifiedUid.mockResolvedValue("creator-1");
    mockGetGroupById.mockResolvedValue({
      id: "group-1",
      name: "Weekend Plans",
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      creatorId: "creator-1",
      memberIds: ["creator-1", "member-1", "admin-1"],
      adminIds: ["creator-1"],
      picksRestricted: false,
    });
    mockPromoteAdmin.mockResolvedValue(undefined);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetVerifiedUid.mockResolvedValue(undefined);

    const response = await POST(makeRequest({ uid: "member-1" }), {
      params: Promise.resolve({ id: "group-1" }),
    });

    expect(response.status).toBe(401);
    expect(mockPromoteAdmin).not.toHaveBeenCalled();
  });

  it("returns 404 when group is not found", async () => {
    mockGetGroupById.mockResolvedValue(undefined);

    const response = await POST(makeRequest({ uid: "member-1" }), {
      params: Promise.resolve({ id: "group-1" }),
    });

    expect(response.status).toBe(404);
    expect(mockPromoteAdmin).not.toHaveBeenCalled();
  });

  it("returns 403 when caller is not the group creator", async () => {
    mockGetVerifiedUid.mockResolvedValue("admin-1");
    mockGetGroupById.mockResolvedValue({
      id: "group-1",
      name: "Weekend Plans",
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      creatorId: "creator-1",
      memberIds: ["creator-1", "member-1", "admin-1"],
      adminIds: ["creator-1", "admin-1"],
      picksRestricted: false,
    });

    const response = await POST(makeRequest({ uid: "member-1" }), {
      params: Promise.resolve({ id: "group-1" }),
    });

    expect(response.status).toBe(403);
    expect(mockPromoteAdmin).not.toHaveBeenCalled();
  });

  it("returns 400 when uid is missing from body", async () => {
    const request = new Request("http://localhost/api/groups/group-1/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: "group-1" }),
    });

    expect(response.status).toBe(400);
    expect(mockPromoteAdmin).not.toHaveBeenCalled();
  });

  it("returns 404 when target uid is not a group member", async () => {
    const response = await POST(makeRequest({ uid: "outsider-1" }), {
      params: Promise.resolve({ id: "group-1" }),
    });

    expect(response.status).toBe(404);
    expect(mockPromoteAdmin).not.toHaveBeenCalled();
  });

  it("returns 409 when target uid is already an admin", async () => {
    mockGetGroupById.mockResolvedValue({
      id: "group-1",
      name: "Weekend Plans",
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      creatorId: "creator-1",
      memberIds: ["creator-1", "admin-1"],
      adminIds: ["creator-1", "admin-1"],
      picksRestricted: false,
    });

    const response = await POST(makeRequest({ uid: "admin-1" }), {
      params: Promise.resolve({ id: "group-1" }),
    });

    expect(response.status).toBe(409);
    expect(mockPromoteAdmin).not.toHaveBeenCalled();
  });

  it("calls promoteAdmin and returns 200 on success", async () => {
    const response = await POST(makeRequest({ uid: "member-1" }), {
      params: Promise.resolve({ id: "group-1" }),
    });

    expect(response.status).toBe(200);
    expect(mockPromoteAdmin).toHaveBeenCalledWith("group-1", "member-1");
  });
});
