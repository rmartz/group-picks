import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { GroupDetailView } from "./GroupDetailView";
import { GROUP_DETAIL_COPY } from "./copy";
import { PickStatus, type GroupPick } from "@/lib/types/pick";
import type { Category } from "@/lib/types/category";

afterEach(cleanup);

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
  };
}

function makeCategory(overrides?: Partial<Category>): Category {
  return {
    id: "cat-1",
    name: "Best Movies",
    groupId: "group-1",
    createdAt: new Date("2025-01-15T12:00:00.000Z"),
    creatorId: "user-123",
    ...overrides,
  };
}

function makePick(overrides?: Partial<GroupPick>): GroupPick {
  return {
    id: "pick-1",
    title: "The Shawshank Redemption",
    categoryId: "cat-1",
    status: PickStatus.Open,
    createdAt: new Date("2025-01-20T12:00:00.000Z"),
    creatorId: "user-123",
    ...overrides,
  };
}

describe("GroupDetailView", () => {
  it("renders the group name", () => {
    const group = makeGroup();
    render(<GroupDetailView group={group} categories={[]} picks={[]} />);

    expect(screen.getByText(group.name)).toBeDefined();
  });

  it("renders the member count", () => {
    const group = makeGroup();
    render(<GroupDetailView group={group} categories={[]} picks={[]} />);

    expect(
      screen.getByText(GROUP_DETAIL_COPY.membersLabel + ":"),
    ).toBeDefined();
    expect(screen.getByText(String(group.memberIds.length))).toBeDefined();
  });

  it("renders the created at label", () => {
    const group = makeGroup();
    render(<GroupDetailView group={group} categories={[]} picks={[]} />);

    expect(
      screen.getByText(GROUP_DETAIL_COPY.createdAtLabel + ":"),
    ).toBeDefined();
  });

  it("renders the picks section heading", () => {
    const group = makeGroup();
    render(<GroupDetailView group={group} categories={[]} picks={[]} />);

    expect(screen.getByText(GROUP_DETAIL_COPY.picksLabel)).toBeDefined();
  });

  it("renders the empty picks message when there are no picks", () => {
    const group = makeGroup();
    render(<GroupDetailView group={group} categories={[]} picks={[]} />);

    expect(screen.getByText(GROUP_DETAIL_COPY.noPicksMessage)).toBeDefined();
  });

  it("renders pick titles", () => {
    const group = makeGroup();
    const category = makeCategory();
    const pick = makePick();
    render(
      <GroupDetailView group={group} categories={[category]} picks={[pick]} />,
    );

    expect(screen.getByText(pick.title)).toBeDefined();
  });

  it("renders the category name as a group header for picks", () => {
    const group = makeGroup();
    const category = makeCategory({ name: "Best Movies" });
    const pick = makePick({ categoryId: category.id });
    render(
      <GroupDetailView group={group} categories={[category]} picks={[pick]} />,
    );

    expect(screen.getByText(category.name)).toBeDefined();
  });

  it("renders the open status chip for an open pick", () => {
    const group = makeGroup();
    const category = makeCategory();
    const pick = makePick({ status: PickStatus.Open });
    render(
      <GroupDetailView group={group} categories={[category]} picks={[pick]} />,
    );

    expect(
      screen.getByText(`● ${GROUP_DETAIL_COPY.statusOpen}`),
    ).toBeDefined();
  });

  it("renders the closed status chip for a closed pick", () => {
    const group = makeGroup();
    const category = makeCategory();
    const pick = makePick({ status: PickStatus.Closed });
    render(
      <GroupDetailView group={group} categories={[category]} picks={[pick]} />,
    );

    expect(screen.getByText(GROUP_DETAIL_COPY.statusClosed)).toBeDefined();
  });

  it("renders the due date with closes prefix for an open pick", () => {
    const group = makeGroup();
    const category = makeCategory();
    const dueDate = new Date("2025-03-15T00:00:00.000Z");
    const pick = makePick({ status: PickStatus.Open, dueDate });
    render(
      <GroupDetailView group={group} categories={[category]} picks={[pick]} />,
    );

    const formatted = dueDate.toLocaleDateString();
    expect(
      screen.getByText(`${GROUP_DETAIL_COPY.closesPrefix} ${formatted}`),
    ).toBeDefined();
  });

  it("renders the due date with closed prefix for a closed pick", () => {
    const group = makeGroup();
    const category = makeCategory();
    const dueDate = new Date("2025-03-15T00:00:00.000Z");
    const pick = makePick({ status: PickStatus.Closed, dueDate });
    render(
      <GroupDetailView group={group} categories={[category]} picks={[pick]} />,
    );

    const formatted = dueDate.toLocaleDateString();
    expect(
      screen.getByText(`${GROUP_DETAIL_COPY.closedPrefix} ${formatted}`),
    ).toBeDefined();
  });

  it("does not render the empty picks message when picks are provided", () => {
    const group = makeGroup();
    const category = makeCategory();
    const pick = makePick();
    render(
      <GroupDetailView group={group} categories={[category]} picks={[pick]} />,
    );

    expect(
      screen.queryByText(GROUP_DETAIL_COPY.noPicksMessage),
    ).toBeNull();
  });
});
