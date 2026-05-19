import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetVerifiedUid, mockGetGroupById, mockDeleteGroup } = vi.hoisted(
  () => ({
    mockGetVerifiedUid: vi.fn(),
    mockGetGroupById: vi.fn(),
    mockDeleteGroup: vi.fn(),
  }),
);

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/data/groups", () => ({
  deleteGroup: mockDeleteGroup,
  getGroupById: mockGetGroupById,
}));

const { DELETE } = await import("./route");

const baseParams = { id: "group-1" };

function makeRequest() {
  return new Request("http://localhost/api/groups/group-1/destroy", {
    method: "DELETE",
  });
}

function makeGroup(overrides?: Record<string, unknown>) {
  return {
    id: "group-1",
    name: "Test Group",
    createdAt: new Date(),
    creatorId: "user-1",
    memberIds: ["user-1", "user-2"],
    adminIds: ["user-1"],
    picksRestricted: false,
    inviteToken: "tok",
    ...overrides,
  };
}

describe("DELETE /api/groups/[id]/destroy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVerifiedUid.mockResolvedValue("user-1");
    mockGetGroupById.mockResolvedValue(makeGroup());
    mockDeleteGroup.mockResolvedValue(undefined);
  });

  afterEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetVerifiedUid.mockResolvedValue(null);
    const res = await DELETE(makeRequest(), {
      params: Promise.resolve(baseParams),
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 when group not found", async () => {
    mockGetGroupById.mockResolvedValue(undefined);
    const res = await DELETE(makeRequest(), {
      params: Promise.resolve(baseParams),
    });
    expect(res.status).toBe(404);
  });

  it("returns 403 when caller is not the group creator", async () => {
    mockGetVerifiedUid.mockResolvedValue("user-2");
    const res = await DELETE(makeRequest(), {
      params: Promise.resolve(baseParams),
    });
    expect(res.status).toBe(403);
  });

  it("calls deleteGroup with the group id and member ids on success", async () => {
    const group = makeGroup({ memberIds: ["user-1", "user-2", "user-3"] });
    mockGetGroupById.mockResolvedValue(group);

    await DELETE(makeRequest(), { params: Promise.resolve(baseParams) });

    expect(mockDeleteGroup).toHaveBeenCalledWith("group-1", [
      "user-1",
      "user-2",
      "user-3",
    ]);
  });

  it("returns 204 on success", async () => {
    const res = await DELETE(makeRequest(), {
      params: Promise.resolve(baseParams),
    });
    expect(res.status).toBe(204);
  });

  it("does not call deleteGroup when caller is not the creator", async () => {
    mockGetVerifiedUid.mockResolvedValue("user-2");
    await DELETE(makeRequest(), { params: Promise.resolve(baseParams) });
    expect(mockDeleteGroup).not.toHaveBeenCalled();
  });
});
