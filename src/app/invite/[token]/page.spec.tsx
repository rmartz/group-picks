import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetVerifiedUid,
  mockGetGroupInviteByToken,
  mockGetGroupById,
  mockGetMemberDisplayNames,
  mockGetMostRecentOpenPick,
  mockRedirect,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockGetGroupInviteByToken: vi.fn(),
  mockGetGroupById: vi.fn(),
  mockGetMemberDisplayNames: vi.fn(),
  mockGetMostRecentOpenPick: vi.fn(),
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
  getMemberDisplayNames: mockGetMemberDisplayNames,
}));

vi.mock("@/server/data/current-pick", () => ({
  getMostRecentOpenPick: mockGetMostRecentOpenPick,
}));

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

vi.mock("./InviteLandingView", () => ({
  InviteLandingView: ({
    groupName,
    groupEmoji,
    currentPick,
  }: {
    groupName: string;
    groupEmoji: string;
    currentPick?: { title: string };
  }) => (
    <div data-testid="invite-landing-view">
      <span>{`${groupEmoji} ${groupName}`}</span>
      <span data-testid="current-pick-title">{currentPick?.title ?? ""}</span>
    </div>
  ),
}));

const { default: InvitePage } = await import("./page");

afterEach(cleanup);

describe("InvitePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVerifiedUid.mockResolvedValue(undefined);
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
    mockGetMemberDisplayNames.mockResolvedValue([]);
    mockGetMostRecentOpenPick.mockResolvedValue(undefined);
  });

  it("renders the invite landing card with the group emoji", async () => {
    const page = await InvitePage({
      params: Promise.resolve({ token: "invite-token" }),
    });

    render(page);

    expect(screen.getByTestId("invite-landing-view").textContent).toBe(
      "🎬 Movie Night",
    );
  });

  it("passes the group's current open pick title to the landing view", async () => {
    mockGetMostRecentOpenPick.mockResolvedValue({
      title: "Friday Movie Night",
      dueDate: new Date("2026-02-01T00:00:00.000Z"),
    });

    const page = await InvitePage({
      params: Promise.resolve({ token: "invite-token" }),
    });

    render(page);

    expect(screen.getByTestId("current-pick-title").textContent).toBe(
      "Friday Movie Night",
    );
  });

  it("resolves only the member preview subset rather than every member", async () => {
    await InvitePage({
      params: Promise.resolve({ token: "invite-token" }),
    });

    expect(mockGetMemberDisplayNames).toHaveBeenCalledWith(
      ["user-1", "user-2"],
      3,
    );
  });
});
