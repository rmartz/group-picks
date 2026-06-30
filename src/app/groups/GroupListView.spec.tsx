import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { makeGroupWithActivity } from "@/lib/fixtures/groupActivity";

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
      makeGroupWithActivity({ id: "g1", name: "Alpha" }),
      makeGroupWithActivity({ id: "g2", name: "Beta" }),
    ];
    render(<GroupListView groups={groups} />);
    expect(screen.getByText("Alpha")).toBeDefined();
    expect(screen.getByText("Beta")).toBeDefined();
  });

  it("does not render the empty state when there are groups", () => {
    render(<GroupListView groups={[makeGroupWithActivity()]} />);
    expect(screen.queryByText(GROUP_LIST_COPY.emptyHeadline)).toBeNull();
  });

  it("renders group names as links", () => {
    const group = makeGroupWithActivity({ id: "g1", name: "Alpha" });
    render(<GroupListView groups={[group]} />);
    const link = screen.getByRole("link", { name: /Alpha/ });
    expect((link as HTMLAnchorElement).href).toContain("/groups/g1");
  });

  it("renders plural member count for groups with multiple members", () => {
    const group = makeGroupWithActivity({
      id: "g1",
      memberIds: ["user-1", "user-2", "user-3"],
      name: "Alpha",
    });
    render(<GroupListView groups={[group]} />);

    expect(screen.getByText(`3 ${GROUP_LIST_COPY.memberPlural}`)).toBeDefined();
  });

  it("renders singular member count for groups with one member", () => {
    const group = makeGroupWithActivity({
      id: "g1",
      memberIds: ["user-1"],
      name: "Alpha",
    });
    render(<GroupListView groups={[group]} />);

    expect(
      screen.getByText(`1 ${GROUP_LIST_COPY.memberSingular}`),
    ).toBeDefined();
  });

  it("renders the group emoji on each card", () => {
    const group = makeGroupWithActivity({ id: "g1", name: "Alpha", emoji: "🎬" });
    render(<GroupListView groups={[group]} />);

    expect(screen.getByText("🎬")).toBeDefined();
  });
});

describe("activity preview", () => {
  it("renders the activity preview text when provided", () => {
    const group = makeGroupWithActivity(
      { id: "g1", name: "Alpha" },
      { activityPreview: 'New pick "Friday flick"' },
    );
    render(<GroupListView groups={[group]} />);
    expect(screen.getByText('New pick "Friday flick"')).toBeDefined();
  });

  it("does not render an activity line when activityPreview is undefined", () => {
    const group = makeGroupWithActivity(
      { id: "g1", name: "Alpha" },
      { activityPreview: undefined },
    );
    render(<GroupListView groups={[group]} />);
    // No activity text element should be present for this group
    expect(screen.queryByText(/New pick/)).toBeNull();
    expect(screen.queryByText(/Closed:/)).toBeNull();
  });
});

describe("unread badge", () => {
  it("renders the unread count badge when unreadCount > 0", () => {
    const group = makeGroupWithActivity(
      { id: "g1", name: "Alpha" },
      { unreadCount: 3 },
    );
    render(<GroupListView groups={[group]} />);
    expect(screen.getByText("3")).toBeDefined();
  });

  it("does not render a badge when unreadCount is 0", () => {
    const group = makeGroupWithActivity(
      { id: "g1", name: "Alpha" },
      { unreadCount: 0 },
    );
    render(<GroupListView groups={[group]} />);
    // The count "0" should not appear
    expect(screen.queryByText("0")).toBeNull();
  });
});
