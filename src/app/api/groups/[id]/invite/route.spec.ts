import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetVerifiedUid,
  mockGetGroupById,
  mockCreateGroupInvite,
  mockUpdateGroupInviteExpiry,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockGetGroupById: vi.fn(),
  mockCreateGroupInvite: vi.fn(),
  mockUpdateGroupInviteExpiry: vi.fn(),
}));

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/data/groups", () => ({
  getGroupById: mockGetGroupById,
}));

vi.mock("@/server/data/invites", () => ({
  createGroupInvite: mockCreateGroupInvite,
  updateGroupInviteExpiry: mockUpdateGroupInviteExpiry,
}));

const { PATCH } = await import("./route");

const FUTURE_DATE = "2099-12-31";
const PAST_DATE = "2000-01-01";

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

function makePatchRequest(body: unknown) {
  return new Request("http://localhost/api/groups/group-1/invite", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/groups/[id]/invite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVerifiedUid.mockResolvedValue("user-1");
    mockGetGroupById.mockResolvedValue(makeGroup());
    mockUpdateGroupInviteExpiry.mockResolvedValue(undefined);
  });

  it("returns 401 when not authenticated", async () => {
    mockGetVerifiedUid.mockResolvedValue(null);
    const response = await PATCH(makePatchRequest({ expiresAt: FUTURE_DATE }), {
      params: Promise.resolve({ id: "group-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 404 when group does not exist", async () => {
    mockGetGroupById.mockResolvedValue(null);
    const response = await PATCH(makePatchRequest({ expiresAt: FUTURE_DATE }), {
      params: Promise.resolve({ id: "group-1" }),
    });
    expect(response.status).toBe(404);
  });

  it("returns 403 when caller is not a group member", async () => {
    mockGetVerifiedUid.mockResolvedValue("outsider");
    const response = await PATCH(makePatchRequest({ expiresAt: FUTURE_DATE }), {
      params: Promise.resolve({ id: "group-1" }),
    });
    expect(response.status).toBe(403);
  });

  it("returns 400 when body is invalid JSON shape", async () => {
    const response = await PATCH(makePatchRequest({}), {
      params: Promise.resolve({ id: "group-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 when body is invalid JSON", async () => {
    const request = new Request("http://localhost/api/groups/group-1/invite", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: "not-valid-json",
    });
    const response = await PATCH(request, {
      params: Promise.resolve({ id: "group-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 when expiresAt is a past date", async () => {
    const response = await PATCH(makePatchRequest({ expiresAt: PAST_DATE }), {
      params: Promise.resolve({ id: "group-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 when expiresAt is not a valid date string", async () => {
    const response = await PATCH(
      makePatchRequest({ expiresAt: "not-a-date" }),
      { params: Promise.resolve({ id: "group-1" }) },
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 when expiresAt is a datetime string rather than YYYY-MM-DD", async () => {
    const response = await PATCH(
      makePatchRequest({ expiresAt: "2099-12-31T00:00:00.000Z" }),
      { params: Promise.resolve({ id: "group-1" }) },
    );
    expect(response.status).toBe(400);
  });

  it("updates the invite expiry to a future date", async () => {
    const response = await PATCH(makePatchRequest({ expiresAt: FUTURE_DATE }), {
      params: Promise.resolve({ id: "group-1" }),
    });
    expect(response.status).toBe(200);
    expect(mockUpdateGroupInviteExpiry).toHaveBeenCalledWith(
      "active-token",
      expect.any(Date),
    );
  });

  it("returns the updated expiresAt in the response", async () => {
    const response = await PATCH(makePatchRequest({ expiresAt: FUTURE_DATE }), {
      params: Promise.resolve({ id: "group-1" }),
    });
    const data = (await response.json()) as { expiresAt: string };
    expect(typeof data.expiresAt).toBe("string");
    expect(new Date(data.expiresAt).toISOString().startsWith("2099")).toBe(
      true,
    );
  });

  it("clears the invite expiry when expiresAt is null", async () => {
    const response = await PATCH(makePatchRequest({ expiresAt: null }), {
      params: Promise.resolve({ id: "group-1" }),
    });
    expect(response.status).toBe(200);
    expect(mockUpdateGroupInviteExpiry).toHaveBeenCalledWith(
      "active-token",
      null,
    );
  });

  it("returns null expiresAt when cleared", async () => {
    const response = await PATCH(makePatchRequest({ expiresAt: null }), {
      params: Promise.resolve({ id: "group-1" }),
    });
    const data = (await response.json()) as { expiresAt: string | null };
    expect(data.expiresAt).toBeNull();
  });
});
