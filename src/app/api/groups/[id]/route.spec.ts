import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetVerifiedUid, mockGetGroupById, mockUpdatePicksRestricted } =
  vi.hoisted(() => ({
    mockGetVerifiedUid: vi.fn(),
    mockGetGroupById: vi.fn(),
    mockUpdatePicksRestricted: vi.fn(),
  }));

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/data/groups", () => ({
  getGroupById: mockGetGroupById,
  removeMember: vi.fn(),
  updatePicksRestricted: mockUpdatePicksRestricted,
}));

const { PATCH } = await import("./route");

const baseParams = { id: "group-1" };

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/groups/group-1", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

function makeGroup(overrides?: Record<string, unknown>) {
  return {
    id: "group-1",
    name: "G",
    createdAt: new Date(),
    creatorId: "user-1",
    memberIds: ["user-1", "user-2"],
    adminIds: ["user-1"],
    picksRestricted: false,
    inviteToken: "tok",
    ...overrides,
  };
}

describe("PATCH /api/groups/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVerifiedUid.mockResolvedValue("user-1");
    mockGetGroupById.mockResolvedValue(makeGroup());
    mockUpdatePicksRestricted.mockResolvedValue(undefined);
  });

  afterEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetVerifiedUid.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ picksRestricted: true }), {
      params: Promise.resolve(baseParams),
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 when group not found", async () => {
    mockGetGroupById.mockResolvedValue(undefined);
    const res = await PATCH(makeRequest({ picksRestricted: true }), {
      params: Promise.resolve(baseParams),
    });
    expect(res.status).toBe(404);
  });

  it("returns 403 when caller is not a group admin", async () => {
    mockGetVerifiedUid.mockResolvedValue("user-2");
    const res = await PATCH(makeRequest({ picksRestricted: true }), {
      params: Promise.resolve(baseParams),
    });
    expect(res.status).toBe(403);
  });

  it("returns 400 when body is not valid JSON", async () => {
    const req = new Request("http://localhost/api/groups/group-1", {
      method: "PATCH",
      body: "not-json",
      headers: { "content-type": "application/json" },
    });
    const res = await PATCH(req, { params: Promise.resolve(baseParams) });
    expect(res.status).toBe(400);
  });

  it("returns 400 when picksRestricted is not a boolean", async () => {
    const res = await PATCH(makeRequest({ picksRestricted: "yes" }), {
      params: Promise.resolve(baseParams),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when picksRestricted is missing", async () => {
    const res = await PATCH(makeRequest({}), {
      params: Promise.resolve(baseParams),
    });
    expect(res.status).toBe(400);
  });

  it("calls updatePicksRestricted with group id and true", async () => {
    await PATCH(makeRequest({ picksRestricted: true }), {
      params: Promise.resolve(baseParams),
    });
    expect(mockUpdatePicksRestricted).toHaveBeenCalledWith("group-1", true);
  });

  it("calls updatePicksRestricted with group id and false", async () => {
    await PATCH(makeRequest({ picksRestricted: false }), {
      params: Promise.resolve(baseParams),
    });
    expect(mockUpdatePicksRestricted).toHaveBeenCalledWith("group-1", false);
  });

  it("returns 200 with picksRestricted in body on success", async () => {
    const res = await PATCH(makeRequest({ picksRestricted: true }), {
      params: Promise.resolve(baseParams),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { picksRestricted: boolean };
    expect(body.picksRestricted).toBe(true);
  });
});
