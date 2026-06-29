import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUpdate, mockRef } = vi.hoisted(() => ({
  mockUpdate: vi.fn(),
  mockRef: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminApp: () => ({}),
}));

vi.mock("firebase-admin/database", () => ({
  getDatabase: () => ({
    ref: mockRef,
  }),
}));

const { addGroupMember } = await import("./invites");

describe("addGroupMember writes both membership paths", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRef.mockReturnValue({ update: mockUpdate });
    mockUpdate.mockResolvedValue(undefined);
  });

  it("writes the group member set entry", async () => {
    await addGroupMember("group-7", "user-3");

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate.mock.calls[0]?.[0]).toMatchObject({
      "groups/group-7/members/user-3": true,
    });
  });

  it("writes the user-to-group index entry so the group appears in My Groups", async () => {
    await addGroupMember("group-7", "user-3");

    expect(mockUpdate.mock.calls[0]?.[0]).toMatchObject({
      "users/user-3/groups/group-7": true,
    });
  });

  it("writes both paths in a single atomic multi-path update", async () => {
    await addGroupMember("group-7", "user-3");

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledWith({
      "groups/group-7/members/user-3": true,
      "users/user-3/groups/group-7": true,
    });
  });
});

describe("addGroupMember deactivates the consumed invite when given a revokeToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRef.mockReturnValue({ update: mockUpdate });
    mockUpdate.mockResolvedValue(undefined);
  });

  it("marks the revoked invite token inactive", async () => {
    await addGroupMember("group-7", "user-3", "token-xyz");

    expect(mockUpdate.mock.calls[0]?.[0]).toMatchObject({
      "invites/token-xyz/active": false,
    });
  });

  it("writes membership and the invite deactivation in a single atomic update", async () => {
    await addGroupMember("group-7", "user-3", "token-xyz");

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledWith({
      "groups/group-7/members/user-3": true,
      "users/user-3/groups/group-7": true,
      "invites/token-xyz/active": false,
    });
  });
});
