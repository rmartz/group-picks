import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CategoryDetailView } from "./CategoryDetailView";
import { CATEGORY_DETAIL_COPY } from "./copy";
import type { Category } from "@/lib/types/category";
import type { GroupPick } from "@/lib/types/pick";

afterEach(cleanup);

vi.mock("./ReopenPickButton", () => ({
  ReopenPickButton: ({ pickId }: { pickId: string }) => (
    <button data-testid={`reopen-${pickId}`}>
      {CATEGORY_DETAIL_COPY.reopenPickButton}
    </button>
  ),
}));

vi.mock("@/services/picks", () => ({
  updatePick: vi.fn(),
}));

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
    topCount: 3,
    dueDate: new Date("2025-02-01T12:00:00.000Z"),
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

  it("renders the reopen button for a closed pick", () => {
    const category = makeCategory();
    const closedPick = makePick({
      id: "pick-closed",
      closedAt: new Date("2025-02-01T09:00:00.000Z"),
      closedManually: true,
    });
    render(<CategoryDetailView category={category} picks={[closedPick]} />);

    expect(screen.getByTestId("reopen-pick-closed")).toBeDefined();
  });

  it("does not render the reopen button for an open pick", () => {
    const category = makeCategory();
    const openPick = makePick({ id: "pick-open" });
    render(<CategoryDetailView category={category} picks={[openPick]} />);

    expect(screen.queryByTestId("reopen-pick-open")).toBeNull();
  });

  it("renders a closed badge for a closed pick", () => {
    const category = makeCategory();
    const closedPick = makePick({
      closedAt: new Date("2025-02-01T09:00:00.000Z"),
    });
    render(<CategoryDetailView category={category} picks={[closedPick]} />);

    expect(screen.getByText(CATEGORY_DETAIL_COPY.closedBadge)).toBeDefined();
  });

  it("does not render a closed badge for an open pick", () => {
    const category = makeCategory();
    const openPick = makePick({ closedAt: undefined });
    render(<CategoryDetailView category={category} picks={[openPick]} />);

    expect(screen.queryByText(CATEGORY_DETAIL_COPY.closedBadge)).toBeNull();
  });
});
