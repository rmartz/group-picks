import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { GroupListView } from "./GroupListView";
import { GROUP_LIST_COPY } from "./copy";

afterEach(cleanup);

function makeGroup(overrides?: Partial<{ id: string; name: string }>) {
  return {
    id: overrides?.id ?? "group-1",
    name: overrides?.name ?? "Test Group",
    createdAt: new Date("2024-01-01"),
    creatorId: "user-1",
    memberIds: ["user-1"],
  };
}

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
    expect(screen.getByText(GROUP_LIST_COPY.emptyState)).toBeDefined();
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
    expect(screen.queryByText(GROUP_LIST_COPY.emptyState)).toBeNull();
  });

  it("renders group names as links", () => {
    const group = makeGroup({ id: "g1", name: "Alpha" });
    render(<GroupListView groups={[group]} />);
    const link = screen.getByRole("link", { name: "Alpha" });
    expect((link as HTMLAnchorElement).href).toContain("/groups/g1");
  });
});
