import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetVerifiedUid, mockGetGroupById, mockCreateGroupInvite } =
  vi.hoisted(() => ({
    mockGetVerifiedUid: vi.fn(),
    mockGetGroupById: vi.fn(),
    mockCreateGroupInvite: vi.fn(),
  }));

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/data/groups", () => ({
  getGroupById: mockGetGroupById,
}));

vi.mock("@/server/data/invites", () => ({
  createGroupInvite: mockCreateGroupInvite,
}));

const { POST } = await import("./route");

function makeGroup(overrides?: Record<string, unknown>) {
  return {
    id: "group-1",
    name: "Weekend Plans",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    creatorId: "user-1",
    memberIds: ["user-1", "user-2"],
    adminIds: ["user-1"],
    picksRestricted: false,
    inviteToken: "active-token",
    ...overrides,
  };
}

function makePostRequest(body?: unknown) {
  return new Request("http://localhost/api/groups/group-1/invite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

describe("POST /api/groups/[id]/invite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVerifiedUid.mockResolvedValue("user-1");
    mockGetGroupById.mockResolvedValue(makeGroup());
    mockCreateGroupInvite.mockResolvedValue({
      token: "new-token",
      groupId: "group-1",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      mode: "personal",
      active: true,
    });
  });

  it("returns 401 when not authenticated", async () => {
    mockGetVerifiedUid.mockResolvedValue(null);
    const response = await POST(makePostRequest({ mode: "personal" }), {
      params: Promise.resolve({ id: "group-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 404 when group does not exist", async () => {
    mockGetGroupById.mockResolvedValue(null);
    const response = await POST(makePostRequest({ mode: "personal" }), {
      params: Promise.resolve({ id: "group-1" }),
    });
    expect(response.status).toBe(404);
  });

  it("returns 403 when caller is not a group member", async () => {
    mockGetVerifiedUid.mockResolvedValue("outsider");
    const response = await POST(makePostRequest({ mode: "personal" }), {
      params: Promise.resolve({ id: "group-1" }),
    });
    expect(response.status).toBe(403);
  });

  it("returns 400 when mode is missing from body", async () => {
    const response = await POST(makePostRequest({}), {
      params: Promise.resolve({ id: "group-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 when mode is invalid", async () => {
    const response = await POST(makePostRequest({ mode: "monthly" }), {
      params: Promise.resolve({ id: "group-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 when body is invalid JSON", async () => {
    const request = new Request("http://localhost/api/groups/group-1/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "group-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("calls createGroupInvite with personal mode", async () => {
    await POST(makePostRequest({ mode: "personal" }), {
      params: Promise.resolve({ id: "group-1" }),
    });
    expect(mockCreateGroupInvite).toHaveBeenCalledWith(
      "group-1",
      "active-token",
      "personal",
    );
  });

  it("calls createGroupInvite with group mode", async () => {
    mockCreateGroupInvite.mockResolvedValue({
      token: "new-token",
      groupId: "group-1",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      mode: "group",
      active: true,
    });

    await POST(makePostRequest({ mode: "group" }), {
      params: Promise.resolve({ id: "group-1" }),
    });
    expect(mockCreateGroupInvite).toHaveBeenCalledWith(
      "group-1",
      "active-token",
      "group",
    );
  });

  it("returns 201 with token, expiresAt, and mode", async () => {
    const response = await POST(makePostRequest({ mode: "personal" }), {
      params: Promise.resolve({ id: "group-1" }),
    });
    expect(response.status).toBe(201);
    const data = (await response.json()) as {
      token: string;
      expiresAt: string;
      mode: string;
    };
    expect(data.token).toBe("new-token");
    expect(typeof data.expiresAt).toBe("string");
    expect(data.mode).toBe("personal");
  });
});
