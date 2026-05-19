import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { InviteMode } from "@/lib/types/invite";

import { GROUP_DETAIL_COPY } from "./copy";
import { GroupDetailView } from "./GroupDetailView";

afterEach(cleanup);

vi.mock("./InviteSection", () => ({
  InviteSection: ({ initialToken }: { initialToken: string }) => (
    <div data-testid="invite-section">{initialToken}</div>
  ),
}));

vi.mock("./categories/CategoryList", () => ({
  CategoryList: () => <div data-testid="category-list" />,
}));

vi.mock("./LeaveGroupButtonView", () => ({
  LeaveGroupButtonView: () => <div data-testid="leave-group-button" />,
}));

vi.mock("./GroupSettingsPanelView", () => ({
  GroupSettingsPanelView: () => <div data-testid="group-settings-panel" />,
}));

function makeGroup() {
  return {
    id: "group-1",
    name: "Friday Night Picks",
    createdAt: new Date("2025-01-15T12:00:00.000Z"),
    creatorId: "user-123",
    memberIds: ["user-123", "user-456"],
    adminIds: ["user-123"],
    picksRestricted: false,
    inviteToken: "token-abc",
  };
}

const memberNames = [
  { uid: "user-123", name: "Alice" },
  { uid: "user-456", name: "Bob" },
];

function renderView(
  overrides?: Partial<Parameters<typeof GroupDetailView>[0]>,
) {
  const group = makeGroup();
  return render(
    <GroupDetailView
      group={group}
      categories={[]}
      currentUserId="user-123"
      onLeave={vi.fn()}
      memberNames={memberNames}
      picksByCategory={{}}
      initialInviteMode={InviteMode.Group}
      onMakeAdmin={vi.fn()}
      onRevokeAdmin={vi.fn()}
      onRemoveMember={vi.fn()}
      onTogglePicksRestricted={() => undefined}
      isSavingSettings={false}
      settingsError={undefined}
      {...overrides}
    />,
  );
}

describe("GroupDetailView", () => {
  it("renders the group name", () => {
    const group = makeGroup();
    renderView({ group });

    expect(screen.getByText(group.name)).toBeDefined();
  });

  it("renders the member count in the header", () => {
    renderView();

    expect(
      screen.getByText(`2 ${GROUP_DETAIL_COPY.membersLabel}`),
    ).toBeDefined();
  });

  it("renders singular member label when there is one member", () => {
    const group = { ...makeGroup(), memberIds: ["user-123"] };
    renderView({ group, memberNames: [{ uid: "user-123", name: "Alice" }] });

    expect(
      screen.getByText(`1 ${GROUP_DETAIL_COPY.memberSingularLabel}`),
    ).toBeDefined();
  });

  it("renders the Picks tab trigger", () => {
    renderView();

    expect(
      screen.getByRole("tab", { name: GROUP_DETAIL_COPY.tabs.picks }),
    ).toBeDefined();
  });

  it("renders the Categories tab trigger", () => {
    renderView();

    expect(
      screen.getByRole("tab", { name: GROUP_DETAIL_COPY.tabs.categories }),
    ).toBeDefined();
  });

  it("renders the Members tab trigger", () => {
    renderView();

    expect(
      screen.getByRole("tab", { name: GROUP_DETAIL_COPY.tabs.members }),
    ).toBeDefined();
  });

  it("renders each member name (Members tab is keepMounted)", () => {
    renderView();

    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
  });

  it("renders the invite section with the invite token", () => {
    const group = makeGroup();
    renderView({ group });

    expect(screen.getByTestId("invite-section")).toBeDefined();
    expect(screen.getByText(group.inviteToken)).toBeDefined();
  });

  it("renders the no-picks message when there are no picks", () => {
    renderView({ picksByCategory: {} });

    expect(screen.getByText(GROUP_DETAIL_COPY.noPicksMessage)).toBeDefined();
  });

  it("renders open picks in the Open section with the open badge", () => {
    const category = {
      id: "cat-1",
      name: "Movies",
      groupId: "group-1",
      createdAt: new Date("2025-01-01"),
      creatorId: "user-123",
    };
    const openPick = {
      id: "pick-1",
      title: "Best Picture",
      categoryId: "cat-1",
      topCount: 1,
      createdAt: new Date("2025-01-01"),
      creatorId: "user-123",
    };
    renderView({
      categories: [category],
      picksByCategory: { "cat-1": [openPick] },
    });

    expect(screen.getByText(GROUP_DETAIL_COPY.openSection)).toBeDefined();
    expect(screen.getByText(GROUP_DETAIL_COPY.openBadge)).toBeDefined();
    expect(screen.getByText(openPick.title)).toBeDefined();
  });

  it("renders closed picks in the Closed section with the closed badge", () => {
    const category = {
      id: "cat-2",
      name: "TV Shows",
      groupId: "group-1",
      createdAt: new Date("2025-01-01"),
      creatorId: "user-123",
    };
    const closedPick = {
      id: "pick-2",
      title: "Best Series",
      categoryId: "cat-2",
      topCount: 1,
      createdAt: new Date("2025-01-01"),
      creatorId: "user-123",
      closedAt: new Date("2025-06-01"),
    };
    renderView({
      categories: [category],
      picksByCategory: { "cat-2": [closedPick] },
    });

    expect(screen.getByText(GROUP_DETAIL_COPY.closedSection)).toBeDefined();
    expect(screen.getByText(GROUP_DETAIL_COPY.closedBadge)).toBeDefined();
    expect(screen.getByText(closedPick.title)).toBeDefined();
  });

  it("renders a pick detail link pointing to the correct pick URL", () => {
    const category = {
      id: "cat-3",
      name: "Games",
      groupId: "group-1",
      createdAt: new Date("2025-01-01"),
      creatorId: "user-123",
    };
    const pick = {
      id: "pick-3",
      title: "Best Game",
      categoryId: "cat-3",
      topCount: 1,
      createdAt: new Date("2025-01-01"),
      creatorId: "user-123",
    };
    renderView({
      categories: [category],
      picksByCategory: { "cat-3": [pick] },
    });

    const link = screen.getByRole("link", { name: /Best Game/ });
    expect((link as HTMLAnchorElement).href).toContain(
      "/groups/group-1/categories/cat-3/picks/pick-3",
    );
  });

  it("does not render an empty subtitle paragraph when subtitle content is missing", () => {
    const category = {
      id: "cat-4",
      name: "",
      groupId: "group-1",
      createdAt: new Date("2025-01-01"),
      creatorId: "user-123",
    };
    const pick = {
      id: "pick-4",
      title: "No Subtitle Pick",
      categoryId: "cat-4",
      topCount: 1,
      createdAt: new Date("2025-01-01"),
      creatorId: "user-123",
    };
    renderView({
      categories: [category],
      picksByCategory: { "cat-4": [pick] },
    });

    const link = screen.getByRole("link", { name: /No Subtitle Pick/ });
    const subtitleParagraph = link.querySelector(
      "p.text-xs.text-muted-foreground",
    );
    expect(subtitleParagraph).toBeNull();
  });

  describe("group settings panel", () => {
    it("renders the settings panel for admin users", () => {
      const group = { ...makeGroup(), adminIds: ["user-123"] };
      renderView({ group, currentUserId: "user-123" });
      expect(screen.getByTestId("group-settings-panel")).toBeDefined();
    });

    it("does not render the settings panel for non-admin members", () => {
      const group = { ...makeGroup(), adminIds: ["user-123"] };
      renderView({ group, currentUserId: "user-456" });
      expect(screen.queryByTestId("group-settings-panel")).toBeNull();
    });
  });
});

describe("GroupDetailView — member list chips", () => {
  it("shows Creator chip next to the group creator", () => {
    renderView();

    expect(screen.getByText(GROUP_DETAIL_COPY.creatorChip)).toBeDefined();
  });

  it("shows Admin chip next to a promoted non-creator member", () => {
    const group = { ...makeGroup(), adminIds: ["user-123", "user-456"] };
    renderView({ group });

    const adminBadges = screen.getAllByText(GROUP_DETAIL_COPY.adminChip);
    expect(adminBadges.length).toBe(1);
  });

  it("does not show Admin chip next to the creator (Creator chip only)", () => {
    renderView();

    expect(screen.queryByText(GROUP_DETAIL_COPY.adminChip)).toBeNull();
  });
});

describe("GroupDetailView — admin error", () => {
  it("renders the adminError message when provided", () => {
    const errorMessage = GROUP_DETAIL_COPY.errors.adminAction;
    renderView({ adminError: errorMessage });

    expect(screen.getByText(errorMessage)).toBeDefined();
  });

  it("does not render an admin error paragraph when adminError is undefined", () => {
    renderView({ adminError: undefined });

    expect(screen.queryByText(GROUP_DETAIL_COPY.errors.adminAction)).toBeNull();
  });
});

describe("GroupDetailView — member ··· menu visibility", () => {
  it("does not show a menu button when all members are either the creator or the current user, even when the current user is an admin", () => {
    const group = { ...makeGroup(), adminIds: ["user-123", "user-456"] };
    // user-123 is creator → no menu on that row; user-456 is self → no menu
    // So with 2 members (creator + self), there are 0 menus
    renderView({ currentUserId: "user-456", group });

    expect(screen.queryByTestId("member-menu-trigger")).toBeNull();
  });

  it("shows menu buttons for non-self non-creator rows when current user is creator", () => {
    renderView({ currentUserId: "user-123" });

    // Alice (user-123) is creator/self → no menu on Alice's row
    // Bob (user-456) is neither creator nor self → menu
    const menuButtons = screen.getAllByTestId("member-menu-trigger");
    expect(menuButtons.length).toBe(1);
  });

  it("does not show a menu button for non-admin current users", () => {
    // user-456 is not an admin by default (adminIds: ["user-123"])
    renderView({ currentUserId: "user-456" });

    expect(screen.queryByTestId("member-menu-trigger")).toBeNull();
  });

  it("hides the menu on the creator's row even when current user is an admin", () => {
    const group = {
      ...makeGroup(),
      memberIds: ["user-123", "user-456", "user-789"],
      adminIds: ["user-123", "user-456"],
    };
    const names = [
      { uid: "user-123", name: "Alice" },
      { uid: "user-456", name: "Bob" },
      { uid: "user-789", name: "Carol" },
    ];
    // Bob (user-456) is an admin (not creator). Should see menu for Carol only.
    renderView({ group, memberNames: names, currentUserId: "user-456" });

    const menuButtons = screen.getAllByTestId("member-menu-trigger");
    expect(menuButtons.length).toBe(1);
  });
});

describe("GroupDetailView — admin actions in ··· menu (creator view)", () => {
  // TODO: upgrade to userEvent when @testing-library/user-event is available
  it("calls onMakeAdmin with the member uid when Make admin is clicked", () => {
    const onMakeAdmin = vi.fn();
    renderView({ currentUserId: "user-123", onMakeAdmin });

    const trigger = screen.getByTestId("member-menu-trigger");
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText(GROUP_DETAIL_COPY.makeAdminAction));

    expect(onMakeAdmin).toHaveBeenCalledWith("user-456");
  });

  // TODO: upgrade to userEvent when @testing-library/user-event is available
  it("calls onRevokeAdmin with the member uid when Revoke admin is clicked", () => {
    const group = { ...makeGroup(), adminIds: ["user-123", "user-456"] };
    const onRevokeAdmin = vi.fn();
    renderView({ group, currentUserId: "user-123", onRevokeAdmin });

    const trigger = screen.getByTestId("member-menu-trigger");
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText(GROUP_DETAIL_COPY.revokeAdminAction));

    expect(onRevokeAdmin).toHaveBeenCalledWith("user-456");
  });

  it("does not show Make admin / Revoke admin actions to non-creator admins", () => {
    const group = {
      ...makeGroup(),
      memberIds: ["user-123", "user-456", "user-789"],
      adminIds: ["user-123", "user-456"],
    };
    const names = [
      { uid: "user-123", name: "Alice" },
      { uid: "user-456", name: "Bob" },
      { uid: "user-789", name: "Carol" },
    ];
    // Bob (user-456) is admin but NOT creator → no Make/Revoke admin in their menu
    renderView({ group, memberNames: names, currentUserId: "user-456" });

    const trigger = screen.getByTestId("member-menu-trigger");
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);
    fireEvent.click(trigger);

    expect(screen.queryByText(GROUP_DETAIL_COPY.makeAdminAction)).toBeNull();
    expect(screen.queryByText(GROUP_DETAIL_COPY.revokeAdminAction)).toBeNull();
  });
});

describe("GroupDetailView — remove member", () => {
  // TODO: upgrade to userEvent when @testing-library/user-event is available
  it("shows confirmation prompt when Remove from group is clicked", () => {
    renderView({ currentUserId: "user-123" });

    const trigger = screen.getByTestId("member-menu-trigger");
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText(GROUP_DETAIL_COPY.removeAction));

    expect(
      screen.getByText(GROUP_DETAIL_COPY.removeConfirmButton),
    ).toBeDefined();
    expect(
      screen.getByText(GROUP_DETAIL_COPY.removeCancelButton),
    ).toBeDefined();
  });

  it("calls onRemoveMember with the member uid when confirmation is confirmed", () => {
    const onRemoveMember = vi.fn();
    renderView({ currentUserId: "user-123", onRemoveMember });

    const trigger = screen.getByTestId("member-menu-trigger");
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText(GROUP_DETAIL_COPY.removeAction));
    fireEvent.click(screen.getByText(GROUP_DETAIL_COPY.removeConfirmButton));

    expect(onRemoveMember).toHaveBeenCalledWith("user-456");
  });

  it("does not call onRemoveMember when confirmation is cancelled", () => {
    const onRemoveMember = vi.fn();
    renderView({ currentUserId: "user-123", onRemoveMember });

    const trigger = screen.getByTestId("member-menu-trigger");
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText(GROUP_DETAIL_COPY.removeAction));
    fireEvent.click(screen.getByText(GROUP_DETAIL_COPY.removeCancelButton));

    expect(onRemoveMember).not.toHaveBeenCalled();
  });

  it("shows Remove from group action for non-creator admins too", () => {
    const group = {
      ...makeGroup(),
      memberIds: ["user-123", "user-456", "user-789"],
      adminIds: ["user-123", "user-456"],
    };
    const names = [
      { uid: "user-123", name: "Alice" },
      { uid: "user-456", name: "Bob" },
      { uid: "user-789", name: "Carol" },
    ];
    // Bob (user-456) is admin but NOT creator
    renderView({ group, memberNames: names, currentUserId: "user-456" });

    const trigger = screen.getByTestId("member-menu-trigger");
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);
    fireEvent.click(trigger);

    expect(screen.getByText(GROUP_DETAIL_COPY.removeAction)).toBeDefined();
  });

  it("shows the member name in the confirmation description", () => {
    renderView({ currentUserId: "user-123" });

    const trigger = screen.getByTestId("member-menu-trigger");
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText(GROUP_DETAIL_COPY.removeAction));

    expect(
      screen.getByText(GROUP_DETAIL_COPY.removeConfirmMemberTitle("Bob")),
    ).toBeDefined();
  });
});

describe("GroupDetailView — error states", () => {
  it("renders removeMemberError when provided", () => {
    renderView({
      currentUserId: "user-123",
      removeMemberError: GROUP_DETAIL_COPY.removeMemberError,
    });

    expect(screen.getByTestId("remove-member-error").textContent).toBe(
      GROUP_DETAIL_COPY.removeMemberError,
    );
  });

  it("renders adminError when provided", () => {
    renderView({
      currentUserId: "user-123",
      adminError: GROUP_DETAIL_COPY.errors.default,
    });

    expect(screen.getByTestId("admin-error").textContent).toBe(
      GROUP_DETAIL_COPY.errors.default,
    );
  });

  it("does not render the remove-member-error element when removeMemberError is absent", () => {
    renderView({ currentUserId: "user-123" });

    expect(screen.queryByTestId("remove-member-error")).toBeNull();
  });

  it("does not render the admin-error element when adminError is absent", () => {
    renderView({ currentUserId: "user-123" });

    expect(screen.queryByTestId("admin-error")).toBeNull();
  });
});

describe("GroupDetailView — member trigger accessibility", () => {
  it("renders the member-menu-trigger with the correct aria-label", () => {
    renderView({ currentUserId: "user-123" });

    const trigger = screen.getByTestId("member-menu-trigger");
    expect(trigger.getAttribute("aria-label")).toBe(
      GROUP_DETAIL_COPY.memberActionsLabel,
    );
  });
});
