import { beforeEach, describe, expect, it, vi } from "vitest";

import { InviteMode } from "@/lib/types/invite";

const mockTransaction = vi.fn();
const mockRef = vi.fn().mockReturnValue({ transaction: mockTransaction });
const mockGetDatabase = vi.fn().mockReturnValue({ ref: mockRef });

const {
  mockGetVerifiedUid,
  mockGetGroupById,
  mockGetGroupInviteByToken,
  mockAddGroupMember,
  mockGetAdminApp,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockGetGroupById: vi.fn(),
  mockGetGroupInviteByToken: vi.fn(),
  mockAddGroupMember: vi.fn(),
  mockGetAdminApp: vi.fn(),
}));

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/data/groups", () => ({
  getGroupById: mockGetGroupById,
}));

vi.mock("@/server/data/invites", () => ({
  getGroupInviteByToken: mockGetGroupInviteByToken,
  addGroupMember: mockAddGroupMember,
}));

vi.mock("firebase-admin/database", () => ({
  getDatabase: mockGetDatabase,
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminApp: mockGetAdminApp,
}));

const { POST } = await import("./route");

function makeGroup() {
  return {
    id: "group-1",
    name: "Weekend Plans",
    creatorId: "user-1",
    memberIds: ["user-1"],
    adminIds: ["user-1"],
    picksRestricted: false,
    inviteToken: "valid-token",
  };
}

function makeInvite(overrides?: Record<string, unknown>) {
  return {
    token: "valid-token",
    groupId: "group-1",
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    mode: InviteMode.Personal,
    active: true,
    ...overrides,
  };
}

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/groups/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/groups/join — single-use enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVerifiedUid.mockResolvedValue("user-2");
    mockGetGroupInviteByToken.mockResolvedValue(makeInvite());
    mockGetGroupById.mockResolvedValue(makeGroup());
    mockAddGroupMember.mockResolvedValue(undefined);
    mockRef.mockReturnValue({ transaction: mockTransaction });
    mockGetDatabase.mockReturnValue({ ref: mockRef });
    // By default, transaction commits (active: true → false)
    mockTransaction.mockResolvedValue({ committed: true });
  });

  it("consumes the invite atomically and adds the member for a Personal link", async () => {
    const invite = makeInvite();
    mockGetGroupInviteByToken.mockResolvedValue(invite);
    const response = await POST(makeRequest({ token: invite.token }));
    expect(response.status).toBe(200);
    expect(mockRef).toHaveBeenCalledWith(`invites/${invite.token}/active`);
    expect(mockAddGroupMember).toHaveBeenCalledWith(invite.groupId, "user-2");
  });

  it("returns 410 when the Personal invite transaction does not commit", async () => {
    mockTransaction.mockResolvedValue({ committed: false });
    const response = await POST(makeRequest({ token: "valid-token" }));
    expect(response.status).toBe(410);
    expect(mockAddGroupMember).not.toHaveBeenCalled();
  });

  it("adds the member without a transaction for a Group link", async () => {
    const invite = makeInvite({ mode: InviteMode.Group });
    mockGetGroupInviteByToken.mockResolvedValue(invite);
    const response = await POST(makeRequest({ token: invite.token }));
    expect(response.status).toBe(200);
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockAddGroupMember).toHaveBeenCalledWith(invite.groupId, "user-2");
  });

  it("returns 401 when not authenticated", async () => {
    mockGetVerifiedUid.mockResolvedValue(null);
    const response = await POST(makeRequest({ token: "valid-token" }));
    expect(response.status).toBe(401);
  });

  it("returns 404 when token is not found", async () => {
    mockGetGroupInviteByToken.mockResolvedValue(undefined);
    const response = await POST(makeRequest({ token: "valid-token" }));
    expect(response.status).toBe(404);
  });

  it("returns 410 when invite is inactive", async () => {
    mockGetGroupInviteByToken.mockResolvedValue(makeInvite({ active: false }));
    const response = await POST(makeRequest({ token: "valid-token" }));
    expect(response.status).toBe(410);
  });

  it("returns 410 when invite is expired", async () => {
    mockGetGroupInviteByToken.mockResolvedValue(
      makeInvite({ expiresAt: new Date("2000-01-01") }),
    );
    const response = await POST(makeRequest({ token: "valid-token" }));
    expect(response.status).toBe(410);
  });

  it("returns groupId on success", async () => {
    const response = await POST(makeRequest({ token: "valid-token" }));
    const data = (await response.json()) as { groupId: string };
    expect(data.groupId).toBe("group-1");
  });
});
