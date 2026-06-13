import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { makeGroup } from "@/lib/fixtures/group";

import { GROUP_LIST_COPY } from "./copy";
import { GroupListView } from "./GroupListView";

afterEach(cleanup);

describe("GroupListView", () => {
  it("renders the page title", () => {
    render(<GroupListView groups={[]} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      GROUP_LIST_COPY.title,
    );
  });

  it("renders the new group button", () => {
    render(<GroupListView groups={[]} />);
    expect(
      screen.getByRole("link", { name: GROUP_LIST_COPY.newGroupButton }),
    ).toBeDefined();
  });

  it("renders empty state when no groups", () => {
    render(<GroupListView groups={[]} />);
    expect(screen.getByText(GROUP_LIST_COPY.emptyHeadline)).toBeDefined();
  });

  it("renders a list of groups", () => {
    const groups = [
      makeGroup({ id: "g1", name: "Alpha" }),
      makeGroup({ id: "g2", name: "Beta" }),
    ];
    render(<GroupListView groups={groups} />);
    expect(screen.getByText("Alpha")).toBeDefined();
    expect(screen.getByText("Beta")).toBeDefined();
  });

  it("does not render the empty state when there are groups", () => {
    render(<GroupListView groups={[makeGroup()]} />);
    expect(screen.queryByText(GROUP_LIST_COPY.emptyHeadline)).toBeNull();
  });

  it("renders group names as links", () => {
    const group = makeGroup({ id: "g1", name: "Alpha" });
    render(<GroupListView groups={[group]} />);
    const link = screen.getByRole("link", { name: /Alpha/ });
    expect((link as HTMLAnchorElement).href).toContain("/groups/g1");
  });

  it("renders plural member count for groups with multiple members", () => {
    const group = makeGroup({
      id: "g1",
      memberIds: ["user-1", "user-2", "user-3"],
      name: "Alpha",
    });
    render(<GroupListView groups={[group]} />);

    expect(screen.getByText(`3 ${GROUP_LIST_COPY.memberPlural}`)).toBeDefined();
  });

  it("renders singular member count for groups with one member", () => {
    const group = makeGroup({ id: "g1", memberIds: ["user-1"], name: "Alpha" });
    render(<GroupListView groups={[group]} />);

    expect(
      screen.getByText(`1 ${GROUP_LIST_COPY.memberSingular}`),
    ).toBeDefined();
  });

  it("renders a group's activity line when provided", () => {
    const group = makeGroup({
      id: "g1",
      name: "Alpha",
      lastActivity: 'Pick "Friday flick" · new option',
    });
    render(<GroupListView groups={[group]} />);

    expect(screen.getByText('Pick "Friday flick" · new option')).toBeDefined();
  });

  it("renders an unread badge when unreadCount is greater than zero", () => {
    const group = makeGroup({ id: "g1", name: "Alpha", unreadCount: 2 });
    render(<GroupListView groups={[group]} />);

    expect(
      screen.getByLabelText(`2 ${GROUP_LIST_COPY.unreadPlural}`),
    ).toBeDefined();
  });

  it("renders a singular aria-label when unreadCount is 1", () => {
    const group = makeGroup({ id: "g1", name: "Alpha", unreadCount: 1 });
    render(<GroupListView groups={[group]} />);

    expect(
      screen.getByLabelText(`1 ${GROUP_LIST_COPY.unreadSingular}`),
    ).toBeDefined();
  });

  it("hides the unread badge when unreadCount is zero", () => {
    const group = makeGroup({ id: "g1", name: "Alpha", unreadCount: 0 });
    render(<GroupListView groups={[group]} />);

    expect(screen.queryByLabelText(/unread updates/)).toBeNull();
  });
});
