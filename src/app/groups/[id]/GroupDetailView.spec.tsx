import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { GroupDetailView } from "./GroupDetailView";
import { GROUP_DETAIL_COPY } from "./copy";

afterEach(cleanup);

function makeGroup() {
  return {
    id: "group-1",
    name: "Friday Night Picks",
    createdAt: new Date("2025-01-15T12:00:00.000Z"),
    creatorId: "user-123",
    memberIds: ["user-123", "user-456"],
  };
}

function makeCategory(overrides?: Partial<{ id: string; name: string }>) {
  return {
    id: overrides?.id ?? "category-1",
    groupId: "group-1",
    name: overrides?.name ?? "Best Movie",
    createdAt: new Date("2025-01-15T12:00:00.000Z"),
  };
}

describe("GroupDetailView", () => {
  it("renders the group name", () => {
    const group = makeGroup();
    render(<GroupDetailView group={group} categories={[]} />);

    expect(screen.getByText(group.name)).toBeDefined();
  });

  it("renders the member count", () => {
    const group = makeGroup();
    render(<GroupDetailView group={group} categories={[]} />);

    expect(
      screen.getByText(GROUP_DETAIL_COPY.membersLabel + ":"),
    ).toBeDefined();
    expect(screen.getByText(String(group.memberIds.length))).toBeDefined();
  });

  it("renders the created at label", () => {
    const group = makeGroup();
    render(<GroupDetailView group={group} categories={[]} />);

    expect(
      screen.getByText(GROUP_DETAIL_COPY.createdAtLabel + ":"),
    ).toBeDefined();
  });

  it("renders the categories section heading", () => {
    const group = makeGroup();
    render(<GroupDetailView group={group} categories={[]} />);

    expect(screen.getByText(GROUP_DETAIL_COPY.categoriesLabel)).toBeDefined();
  });

  it("renders a link for each category", () => {
    const group = makeGroup();
    const categories = [
      makeCategory({ id: "cat-1", name: "Best Movie" }),
      makeCategory({ id: "cat-2", name: "Best Song" }),
    ];
    render(<GroupDetailView group={group} categories={categories} />);

    const movieLink = screen.getByText("Best Movie");
    expect(movieLink).toBeDefined();
    expect(movieLink.closest("a")?.getAttribute("href")).toBe(
      `/groups/${group.id}/categories/cat-1`,
    );

    const songLink = screen.getByText("Best Song");
    expect(songLink).toBeDefined();
    expect(songLink.closest("a")?.getAttribute("href")).toBe(
      `/groups/${group.id}/categories/cat-2`,
    );
  });

  it("renders an empty list when there are no categories", () => {
    const group = makeGroup();
    render(<GroupDetailView group={group} categories={[]} />);

    const list = screen.getByRole("list");
    expect(list.children).toHaveLength(0);
  });
});
