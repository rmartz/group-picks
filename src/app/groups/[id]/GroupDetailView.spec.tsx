import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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

  it("renders the members label", () => {
    renderView();

    expect(
      screen.getByText(GROUP_DETAIL_COPY.membersLabel + ":"),
    ).toBeDefined();
  });

  it("renders each member name", () => {
    renderView();

    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
  });

  it("does not render a raw member count", () => {
    renderView();

    expect(screen.queryByText("2")).toBeNull();
  });

  it("renders the created at label", () => {
    renderView();

    expect(
      screen.getByText(GROUP_DETAIL_COPY.createdAtLabel + ":"),
    ).toBeDefined();
  });

  it("renders the invite section with the invite token", () => {
    const group = makeGroup();
    renderView({ group });

    expect(screen.getByTestId("invite-section")).toBeDefined();
    expect(screen.getByText(group.inviteToken)).toBeDefined();
  });
});
