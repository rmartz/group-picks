import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetVerifiedUid, mockGetGroupById, mockRemoveGroupMember } =
  vi.hoisted(() => ({
    mockGetVerifiedUid: vi.fn(),
    mockGetGroupById: vi.fn(),
    mockRemoveGroupMember: vi.fn(),
  }));

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/data/groups", () => ({
  getGroupById: mockGetGroupById,
  removeGroupMember: mockRemoveGroupMember,
}));

const { DELETE } = await import("./route");

function makeGroup() {
  return {
    id: "group-1",
    name: "Test Group",
    createdAt: new Date("2025-01-01"),
    creatorId: "user-creator",
    memberIds: ["user-creator", "user-admin", "user-member"],
    adminIds: ["user-creator", "user-admin"],
    picksRestricted: false,
    inviteToken: "token-abc",
  };
}

function makeParams(groupId: string, uid: string) {
  return { params: Promise.resolve({ id: groupId, uid }) };
}

describe("DELETE /api/groups/[id]/members/[uid]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetGroupById.mockResolvedValue(makeGroup());
    mockRemoveGroupMember.mockResolvedValue(undefined);
  });

  it("returns 401 when not authenticated", async () => {
    mockGetVerifiedUid.mockResolvedValue(undefined);

    const response = await DELETE(
      new Request("http://localhost"),
      makeParams("group-1", "user-member"),
    );

    expect(response.status).toBe(401);
  });

  it("returns 404 when the group does not exist", async () => {
    mockGetVerifiedUid.mockResolvedValue("user-admin");
    mockGetGroupById.mockResolvedValue(undefined);

    const response = await DELETE(
      new Request("http://localhost"),
      makeParams("group-1", "user-member"),
    );

    expect(response.status).toBe(404);
  });

  it("returns 403 when caller is not an admin", async () => {
    mockGetVerifiedUid.mockResolvedValue("user-member");

    const response = await DELETE(
      new Request("http://localhost"),
      makeParams("group-1", "user-admin"),
    );

    expect(response.status).toBe(403);
  });

  it("returns 403 when caller is in adminIds but not in memberIds", async () => {
    mockGetVerifiedUid.mockResolvedValue("user-admin");
    mockGetGroupById.mockResolvedValue({
      ...makeGroup(),
      memberIds: ["user-creator", "user-member"],
    });

    const response = await DELETE(
      new Request("http://localhost"),
      makeParams("group-1", "user-member"),
    );

    expect(response.status).toBe(403);
  });

  it("returns 400 when target uid is the caller themselves", async () => {
    mockGetVerifiedUid.mockResolvedValue("user-admin");

    const response = await DELETE(
      new Request("http://localhost"),
      makeParams("group-1", "user-admin"),
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 when target uid is the group creator", async () => {
    mockGetVerifiedUid.mockResolvedValue("user-admin");

    const response = await DELETE(
      new Request("http://localhost"),
      makeParams("group-1", "user-creator"),
    );

    expect(response.status).toBe(400);
  });

  it("returns 404 when target uid is not a member of the group", async () => {
    mockGetVerifiedUid.mockResolvedValue("user-admin");

    const response = await DELETE(
      new Request("http://localhost"),
      makeParams("group-1", "user-stranger"),
    );

    expect(response.status).toBe(404);
  });

  it("calls removeGroupMember with the correct ids on success", async () => {
    mockGetVerifiedUid.mockResolvedValue("user-admin");

    await DELETE(
      new Request("http://localhost"),
      makeParams("group-1", "user-member"),
    );

    expect(mockRemoveGroupMember).toHaveBeenCalledWith(
      "group-1",
      "user-member",
    );
  });

  it("returns 204 on success", async () => {
    mockGetVerifiedUid.mockResolvedValue("user-admin");

    const response = await DELETE(
      new Request("http://localhost"),
      makeParams("group-1", "user-member"),
    );

    expect(response.status).toBe(204);
  });

  it("allows the group creator to remove a member", async () => {
    mockGetVerifiedUid.mockResolvedValue("user-creator");

    const response = await DELETE(
      new Request("http://localhost"),
      makeParams("group-1", "user-member"),
    );

    expect(response.status).toBe(204);
  });
});
