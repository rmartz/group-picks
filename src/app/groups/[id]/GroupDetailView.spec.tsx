import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { GroupDetailView } from "./GroupDetailView";
import { GROUP_DETAIL_COPY } from "./copy";

afterEach(cleanup);

// InviteSection reads window.location.origin and calls the regenerate API;
// stub it for tests.
vi.mock("./InviteSection", () => ({
  InviteSection: ({ initialToken }: { initialToken: string }) => (
    <div data-testid="invite-section">{initialToken}</div>
  ),
}));

vi.mock("./categories/CategoryList", () => ({
  CategoryList: () => <div data-testid="category-list" />,
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

describe("GroupDetailView", () => {
  it("renders the group name", () => {
    const group = makeGroup();
    render(
      <GroupDetailView
        group={group}
        categories={[]}
        currentUserId="user-123"
        onLeave={vi.fn()}
      />,
    );

    expect(screen.getByText(group.name)).toBeDefined();
  });

  it("renders the member count", () => {
    const group = makeGroup();
    render(
      <GroupDetailView
        group={group}
        categories={[]}
        currentUserId="user-123"
        onLeave={vi.fn()}
      />,
    );

    expect(
      screen.getByText(GROUP_DETAIL_COPY.membersLabel + ":"),
    ).toBeDefined();
    expect(screen.getByText(String(group.memberIds.length))).toBeDefined();
  });

  it("renders the created at label", () => {
    const group = makeGroup();
    render(
      <GroupDetailView
        group={group}
        categories={[]}
        currentUserId="user-123"
        onLeave={vi.fn()}
      />,
    );

    expect(
      screen.getByText(GROUP_DETAIL_COPY.createdAtLabel + ":"),
    ).toBeDefined();
  });

  it("renders the invite section with the invite token", () => {
    const group = makeGroup();
    render(
      <GroupDetailView
        group={group}
        categories={[]}
        currentUserId="user-123"
        onLeave={vi.fn()}
      />,
    );

    expect(screen.getByTestId("invite-section")).toBeDefined();
    expect(screen.getByText(group.inviteToken)).toBeDefined();
  });
});
