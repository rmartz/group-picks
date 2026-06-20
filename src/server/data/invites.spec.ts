import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUpdate, mockRef, mockGet, mockSet } = vi.hoisted(() => ({
  mockUpdate: vi.fn(),
  mockRef: vi.fn(),
  mockGet: vi.fn(),
  mockSet: vi.fn(),
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
    mockGet.mockResolvedValue({ exists: () => false, val: () => null });
    mockSet.mockResolvedValue(undefined);
    mockUpdate.mockResolvedValue(undefined);
    mockRef.mockReturnValue({ update: mockUpdate, get: mockGet, set: mockSet });
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
