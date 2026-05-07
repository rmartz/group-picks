import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CategoryDetailView } from "./CategoryDetailView";
import { CATEGORY_DETAIL_COPY } from "./copy";
import type { Category } from "@/lib/types/category";
import { PickStatus, type GroupPick } from "@/lib/types/pick";

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
    closedAt: undefined,
    createdAt: new Date("2025-01-20T12:00:00.000Z"),
    creatorId: "user-123",
    status: PickStatus.Open,
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

  it("renders closed status for closed picks", () => {
    const category = makeCategory();
    const pick = makePick({
      closedAt: new Date("2025-01-21T12:00:00.000Z"),
      status: PickStatus.Closed,
    });
    render(<CategoryDetailView category={category} picks={[pick]} />);

    expect(
      screen.getByText(CATEGORY_DETAIL_COPY.closedPickLabel),
    ).toBeDefined();
  });

  it("renders open status for open picks", () => {
    const category = makeCategory();
    const pick = makePick({ status: PickStatus.Open });
    render(<CategoryDetailView category={category} picks={[pick]} />);

    expect(screen.getByText(CATEGORY_DETAIL_COPY.pickOpenLabel)).toBeDefined();
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

  it("renders close pick button for open picks when action is provided", () => {
    const category = makeCategory();
    const pick = makePick({ status: PickStatus.Open });
    render(
      <CategoryDetailView
        category={category}
        closePickAction={() => Promise.resolve()}
        picks={[pick]}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: CATEGORY_DETAIL_COPY.closePickButton,
      }),
    ).toBeDefined();
  });

  it("does not render close pick button for closed picks", () => {
    const category = makeCategory();
    const pick = makePick({ status: PickStatus.Closed });
    render(
      <CategoryDetailView
        category={category}
        closePickAction={() => Promise.resolve()}
        picks={[pick]}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: CATEGORY_DETAIL_COPY.closePickButton,
      }),
    ).toBeNull();
  });
});
