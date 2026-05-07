import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PicksByCategory, groupPicksByCategory } from "./PicksByCategory";
import { GROUP_DETAIL_COPY } from "./copy";
import { PICK_STATUS_CHIP_COPY } from "@/components/PickStatusChip.copy";
import type { Category } from "@/lib/types/category";
import { PickStatus, type GroupPick } from "@/lib/types/pick";

afterEach(cleanup);

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

describe("groupPicksByCategory", () => {
  it("returns an empty array when there are no picks", () => {
    const result = groupPicksByCategory([makeCategory()], []);

    expect(result).toEqual([]);
  });

  it("groups picks under their category name", () => {
    const category = makeCategory({ id: "cat-1", name: "Movies" });
    const pick = makePick({ categoryId: "cat-1" });

    const result = groupPicksByCategory([category], [pick]);

    expect(result).toHaveLength(1);
    expect(result[0].categoryName).toBe("Movies");
    expect(result[0].picks).toHaveLength(1);
  });

  it("groups multiple picks under the same category", () => {
    const category = makeCategory({ id: "cat-1" });
    const picks = [
      makePick({ id: "p1", categoryId: "cat-1" }),
      makePick({ id: "p2", categoryId: "cat-1" }),
    ];

    const result = groupPicksByCategory([category], picks);

    expect(result).toHaveLength(1);
    expect(result[0].picks).toHaveLength(2);
  });

  it("produces separate groups for picks from different categories", () => {
    const categories = [
      makeCategory({ id: "cat-1", name: "Movies" }),
      makeCategory({ id: "cat-2", name: "Books" }),
    ];
    const picks = [
      makePick({ id: "p1", categoryId: "cat-1" }),
      makePick({ id: "p2", categoryId: "cat-2" }),
    ];

    const result = groupPicksByCategory(categories, picks);

    expect(result).toHaveLength(2);
  });

  it("falls back to the category ID when the category is not in the list", () => {
    const pick = makePick({ categoryId: "unknown-cat" });

    const result = groupPicksByCategory([], [pick]);

    expect(result[0].categoryName).toBe("unknown-cat");
  });
});

describe("PicksByCategory", () => {
  it("renders pick titles grouped under category names", () => {
    const category = makeCategory({ name: "Best Movies" });
    const pick = makePick({ title: "The Shawshank Redemption" });
    render(<PicksByCategory categories={[category]} picks={[pick]} />);

    expect(screen.getByText("Best Movies")).toBeDefined();
    expect(screen.getByText("The Shawshank Redemption")).toBeDefined();
  });

  it("renders the open status chip", () => {
    const category = makeCategory();
    const pick = makePick({ status: PickStatus.Open });
    render(<PicksByCategory categories={[category]} picks={[pick]} />);

    expect(
      screen.getByText(`● ${PICK_STATUS_CHIP_COPY.statusOpen}`),
    ).toBeDefined();
  });

  it("renders the closed status chip", () => {
    const category = makeCategory();
    const pick = makePick({ status: PickStatus.Closed });
    render(<PicksByCategory categories={[category]} picks={[pick]} />);

    expect(screen.getByText(PICK_STATUS_CHIP_COPY.statusClosed)).toBeDefined();
  });

  it("renders the due date with closes prefix for an open pick", () => {
    const category = makeCategory();
    const dueDate = new Date("2025-03-15T00:00:00.000Z");
    const pick = makePick({ status: PickStatus.Open, dueDate });
    render(<PicksByCategory categories={[category]} picks={[pick]} />);

    const formatted = dueDate.toLocaleDateString();
    expect(
      screen.getByText(`${GROUP_DETAIL_COPY.closesPrefix} ${formatted}`),
    ).toBeDefined();
  });

  it("renders the due date with closed prefix for a closed pick", () => {
    const category = makeCategory();
    const dueDate = new Date("2025-03-15T00:00:00.000Z");
    const pick = makePick({ status: PickStatus.Closed, dueDate });
    render(<PicksByCategory categories={[category]} picks={[pick]} />);

    const formatted = dueDate.toLocaleDateString();
    expect(
      screen.getByText(`${GROUP_DETAIL_COPY.closedPrefix} ${formatted}`),
    ).toBeDefined();
  });

  it("does not render a due date row when dueDate is absent", () => {
    const category = makeCategory();
    const pick = makePick({ dueDate: undefined });
    render(<PicksByCategory categories={[category]} picks={[pick]} />);

    expect(
      screen.queryByText(new RegExp(GROUP_DETAIL_COPY.closesPrefix)),
    ).toBeNull();
  });
});
