import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CategoryDetailView } from "./CategoryDetailView";
import { CATEGORY_DETAIL_COPY } from "./copy";
import type { Category } from "@/lib/types/category";
import type { GroupPick } from "@/lib/types/pick";

afterEach(cleanup);

function makeCategory(overrides?: Partial<Category>): Category {
  return {
    id: "cat-1",
    name: "Best Movies",
    description: "Pick your favourite movie of the year",
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
    description: "A classic film about hope",
    categoryId: "cat-1",
    createdAt: new Date("2025-01-20T12:00:00.000Z"),
    creatorId: "user-123",
    ...overrides,
  };
}

describe("CategoryDetailView", () => {
  it("renders the category name", () => {
    const category = makeCategory();
    render(<CategoryDetailView category={category} picks={[]} />);

    expect(screen.getByText(category.name)).toBeDefined();
  });

  it("renders the category description", () => {
    const category = makeCategory({ description: "Pick your favourite movie" });
    render(<CategoryDetailView category={category} picks={[]} />);

    expect(screen.getByText("Pick your favourite movie")).toBeDefined();
  });

  it("does not render category description when absent", () => {
    const category = makeCategory({ description: undefined });
    render(<CategoryDetailView category={category} picks={[]} />);

    expect(
      screen.queryByText("Pick your favourite movie of the year"),
    ).toBeNull();
  });

  it("does not render category description when whitespace-only", () => {
    const category = makeCategory({ description: "   " });
    render(<CategoryDetailView category={category} picks={[]} />);

    expect(screen.queryByText("   ")).toBeNull();
  });

  it("renders the picks section heading", () => {
    const category = makeCategory();
    render(<CategoryDetailView category={category} picks={[]} />);

    expect(screen.getByText(CATEGORY_DETAIL_COPY.picksLabel)).toBeDefined();
  });

  it("renders the empty state when there are no picks", () => {
    const category = makeCategory();
    render(<CategoryDetailView category={category} picks={[]} />);

    expect(screen.getByText(CATEGORY_DETAIL_COPY.noPicksMessage)).toBeDefined();
  });

  it("renders pick titles when picks are provided", () => {
    const category = makeCategory();
    const pick = makePick();
    render(<CategoryDetailView category={category} picks={[pick]} />);

    expect(screen.getByText(pick.title)).toBeDefined();
  });

  it("renders pick descriptions when provided", () => {
    const category = makeCategory();
    const pick = makePick({ description: "A classic film about hope" });
    render(<CategoryDetailView category={category} picks={[pick]} />);

    expect(screen.getByText("A classic film about hope")).toBeDefined();
  });

  it("does not render pick description when absent", () => {
    const category = makeCategory();
    const pick = makePick({ description: undefined });
    render(<CategoryDetailView category={category} picks={[pick]} />);

    expect(screen.queryByText("A classic film about hope")).toBeNull();
  });

  it("does not render pick description when whitespace-only", () => {
    const category = makeCategory();
    const pick = makePick({ description: "   " });
    render(<CategoryDetailView category={category} picks={[pick]} />);

    expect(screen.queryByText("   ")).toBeNull();
  });

  it("renders multiple picks", () => {
    const category = makeCategory();
    const picks = [
      makePick({ id: "pick-1", title: "Movie One" }),
      makePick({ id: "pick-2", title: "Movie Two" }),
    ];
    render(<CategoryDetailView category={category} picks={picks} />);

    expect(screen.getByText("Movie One")).toBeDefined();
    expect(screen.getByText("Movie Two")).toBeDefined();
  });

  it("does not render the empty state when picks are provided", () => {
    const category = makeCategory();
    const pick = makePick();
    render(<CategoryDetailView category={category} picks={[pick]} />);

    expect(screen.queryByText(CATEGORY_DETAIL_COPY.noPicksMessage)).toBeNull();
  });

  it("renders locked top picks state when pick is still open", () => {
    const category = makeCategory({
      topPickCount: 3,
      rankedCount: 2,
      totalCount: 5,
    });
    const picks = [
      makePick({ id: "pick-1", title: "Movie One" }),
      makePick({ id: "pick-2", title: "Movie Two" }),
      makePick({ id: "pick-3", title: "Movie Three" }),
    ];

    render(<CategoryDetailView category={category} picks={picks} />);

    expect(
      screen.getByText(CATEGORY_DETAIL_COPY.topPicksLockedHeadline),
    ).toBeDefined();
    expect(
      screen.getByText(CATEGORY_DETAIL_COPY.topPicksLockedDescription),
    ).toBeDefined();
    expect(screen.getByText("2/5")).toBeDefined();
    expect(screen.queryByText("#1 Movie One")).toBeNull();
  });

  it("renders only top N ranked picks when the pick is closed", () => {
    const category = makeCategory({
      topPickCount: 2,
      rankedBallots: [
        ["pick-1", "pick-2", "pick-3"],
        ["pick-1", "pick-3", "pick-2"],
        ["pick-2", "pick-1", "pick-3"],
      ],
      closedAt: new Date("2025-01-21T00:00:00.000Z"),
    });
    const picks = [
      makePick({ id: "pick-1", title: "Movie One" }),
      makePick({ id: "pick-2", title: "Movie Two" }),
      makePick({ id: "pick-3", title: "Movie Three" }),
    ];

    render(<CategoryDetailView category={category} picks={picks} />);

    expect(screen.getByText("Top 2")).toBeDefined();
    expect(screen.getByText("#1 Movie One")).toBeDefined();
    expect(screen.getByText("#2 Movie Two")).toBeDefined();
    expect(screen.queryByText("#3 Movie Three")).toBeNull();
    expect(
      screen.queryByText(CATEGORY_DETAIL_COPY.topPicksLockedHeadline),
    ).toBeNull();
  });
});
