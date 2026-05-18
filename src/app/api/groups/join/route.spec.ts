import { beforeEach, describe, expect, it, vi } from "vitest";

import { InviteMode } from "@/lib/types/invite";

const {
  mockGetVerifiedUid,
  mockGetGroupById,
  mockGetGroupInviteByToken,
  mockAddGroupMember,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockGetGroupById: vi.fn(),
  mockGetGroupInviteByToken: vi.fn(),
  mockAddGroupMember: vi.fn(),
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
  });

  it("revokes the invite after a successful join via a Personal link", async () => {
    const response = await POST(makeRequest({ token: "valid-token" }));
    expect(response.status).toBe(200);
    expect(mockAddGroupMember).toHaveBeenCalledWith(
      "group-1",
      "user-2",
      "valid-token",
    );
  });

  it("does not revoke the invite after a successful join via a Group link", async () => {
    mockGetGroupInviteByToken.mockResolvedValue(
      makeInvite({ mode: InviteMode.Group }),
    );
    const response = await POST(makeRequest({ token: "valid-token" }));
    expect(response.status).toBe(200);
    expect(mockAddGroupMember).toHaveBeenCalledWith("group-1", "user-2", undefined);
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
