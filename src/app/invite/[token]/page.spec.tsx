import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetVerifiedUid,
  mockGetGroupInviteByToken,
  mockGetGroupById,
  mockRedirect,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockGetGroupInviteByToken: vi.fn(),
  mockGetGroupById: vi.fn(),
  mockRedirect: vi.fn(),
}));

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/data/invites", () => ({
  getGroupInviteByToken: mockGetGroupInviteByToken,
}));

vi.mock("@/server/data/groups", () => ({
  getGroupById: mockGetGroupById,
}));

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

vi.mock("@/app/groups/join/JoinGroupForm", () => ({
  JoinGroupForm: ({
    groupName,
    groupEmoji,
  }: {
    groupName: string;
    groupEmoji: string;
  }) => <div data-testid="join-group-form">{`${groupEmoji} ${groupName}`}</div>,
}));

const { default: InvitePage } = await import("./page");

describe("InvitePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVerifiedUid.mockResolvedValue("user-1");
    mockGetGroupInviteByToken.mockResolvedValue({
      token: "invite-token",
      groupId: "group-1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      expiresAt: new Date("2026-12-31T00:00:00.000Z"),
      active: true,
      mode: "group",
    });
    mockGetGroupById.mockResolvedValue({
      id: "group-1",
      name: "Movie Night",
      emoji: "🎬",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      creatorId: "user-1",
      memberIds: ["user-1", "user-2"],
      adminIds: ["user-1"],
      picksRestricted: false,
      inviteToken: "invite-token",
    });
  });

  it("renders the invite landing card with the group emoji", async () => {
    const page = await InvitePage({
      params: Promise.resolve({ token: "invite-token" }),
    });

    render(page);

    expect(screen.getByTestId("join-group-form").textContent).toBe(
      "🎬 Movie Night",
    );
  });
});
