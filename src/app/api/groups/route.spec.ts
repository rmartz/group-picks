import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetVerifiedUid,
  mockGetAdminApp,
  mockGroupToFirebase,
  mockGroupInviteToFirebase,
  mockGetDatabase,
  mockRef,
  mockUpdate,
  mockPush,
} = vi.hoisted(() => {
  const push = vi.fn().mockReturnValue({ key: "group-1" });
  const update = vi.fn().mockResolvedValue(undefined);
  const ref = vi.fn((path?: string) => {
    if (path === "groups") {
      return { push };
    }
    return { update };
  });
  return {
    mockGetVerifiedUid: vi.fn(),
    mockGetAdminApp: vi.fn(),
    mockGroupToFirebase: vi.fn(() => ({ persisted: true })),
    mockGroupInviteToFirebase: vi.fn(() => ({ persisted: true })),
    mockGetDatabase: vi.fn(() => ({ ref })),
    mockRef: ref,
    mockUpdate: update,
    mockPush: push,
  };
});

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminApp: mockGetAdminApp,
}));

vi.mock("firebase-admin/database", () => ({
  getDatabase: mockGetDatabase,
}));

vi.mock("@/lib/firebase/schema/group", () => ({
  groupToFirebase: mockGroupToFirebase,
}));

vi.mock("@/lib/firebase/schema/invite", () => ({
  groupInviteToFirebase: mockGroupInviteToFirebase,
}));

const { POST } = await import("./route");

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/groups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVerifiedUid.mockResolvedValue("user-1");
    mockGetDatabase.mockReturnValue({ ref: mockRef });
    mockPush.mockReturnValue({ key: "group-1" });
  });

  it("falls back to default emoji when empty string is provided", async () => {
    const response = await POST(
      makeRequest({ name: "Movie Night", emoji: "" }),
    );

    expect(response.status).toBe(201);
    expect(mockGroupToFirebase).toHaveBeenCalledWith(
      expect.objectContaining({ emoji: "👥" }),
    );
    expect(mockUpdate).toHaveBeenCalledOnce();
  });

  it("trims a provided emoji before persisting", async () => {
    const response = await POST(
      makeRequest({ name: "Movie Night", emoji: "  🎬  " }),
    );

    expect(response.status).toBe(201);
    expect(mockGroupToFirebase).toHaveBeenCalledWith(
      expect.objectContaining({ emoji: "🎬" }),
    );
  });
});
