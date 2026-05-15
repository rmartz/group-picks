import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Category } from "@/lib/types/category";
import type { GroupPick } from "@/lib/types/pick";

import { CategoryDetailView } from "./CategoryDetailView";
import { CATEGORY_DETAIL_COPY } from "./copy";

afterEach(cleanup);

vi.mock("./ReopenPickButton", () => ({
  ReopenPickButton: ({ pickId }: { pickId: string }) => (
    <button data-testid={`reopen-${pickId}`}>
      {CATEGORY_DETAIL_COPY.reopenPickButton}
    </button>
  ),
}));

function makeCategory(overrides?: Partial<Category>): Category {
  return {
    id: "cat-1",
    name: "Best Movies",
    description: "Vote on the best movies",
    groupId: "group-1",
    createdAt: new Date("2025-06-15T12:00:00.000Z"),
    creatorId: "user-1",
    ...overrides,
  };
}

function makePick(overrides?: Partial<GroupPick>): GroupPick {
  return {
    id: "pick-1",
    title: "The Shawshank Redemption",
    description: "A classic film about hope",
    topCount: 3,
    categoryId: "cat-1",
    closedAt: undefined,
    createdAt: new Date("2025-01-20T12:00:00.000Z"),
    creatorId: "user-1",
    ...overrides,
  };
}

describe("CategoryDetailView — category metadata", () => {
  it("renders the category name as a heading", () => {
    render(<CategoryDetailView category={makeCategory()} picks={[]} />);

    expect(screen.getByText("Best Movies")).toBeDefined();
  });

  it("renders the created at label", () => {
    render(<CategoryDetailView category={makeCategory()} picks={[]} />);

    expect(
      screen.getByText(CATEGORY_DETAIL_COPY.createdAtLabel + ":"),
    ).toBeDefined();
  });

  it("renders the formatted created at date", () => {
    const category = makeCategory();
    render(<CategoryDetailView category={category} picks={[]} />);

    expect(
      screen.getByText(category.createdAt.toLocaleDateString()),
    ).toBeDefined();
  });
});

describe("CategoryDetailView — picks list", () => {
  it("renders the picks section heading", () => {
    render(<CategoryDetailView category={makeCategory()} picks={[]} />);

    expect(screen.getByText(CATEGORY_DETAIL_COPY.picksLabel)).toBeDefined();
  });

  it("renders the empty state when there are no picks", () => {
    render(<CategoryDetailView category={makeCategory()} picks={[]} />);

    expect(screen.getByText(CATEGORY_DETAIL_COPY.noPicksMessage)).toBeDefined();
  });

  it("does not render the empty state when picks are present", () => {
    render(
      <CategoryDetailView category={makeCategory()} picks={[makePick()]} />,
    );

    expect(screen.queryByText(CATEGORY_DETAIL_COPY.noPicksMessage)).toBeNull();
  });

  it("renders pick titles when picks are provided", () => {
    const pick = makePick({ title: "My Pick Title" });
    render(<CategoryDetailView category={makeCategory()} picks={[pick]} />);

    expect(screen.getByText("My Pick Title")).toBeDefined();
  });

  it("renders pick descriptions when provided", () => {
    const pick = makePick({ description: "A classic film about hope" });
    render(<CategoryDetailView category={makeCategory()} picks={[pick]} />);

    expect(screen.getByText("A classic film about hope")).toBeDefined();
  });

  it("does not render pick description when absent", () => {
    const pick = makePick({ description: undefined });
    render(<CategoryDetailView category={makeCategory()} picks={[pick]} />);

    expect(screen.queryByText("A classic film about hope")).toBeNull();
  });

  it("does not render pick description when whitespace-only", () => {
    const pick = makePick({ description: "   " });
    render(<CategoryDetailView category={makeCategory()} picks={[pick]} />);

    expect(
      screen.queryAllByText((_, element) => element?.textContent === "   "),
    ).toHaveLength(0);
  });

  it("renders multiple picks", () => {
    const picks = [
      makePick({ id: "pick-1", title: "Movie One" }),
      makePick({ id: "pick-2", title: "Movie Two" }),
    ];
    render(<CategoryDetailView category={makeCategory()} picks={picks} />);

    expect(screen.getByText("Movie One")).toBeDefined();
    expect(screen.getByText("Movie Two")).toBeDefined();
  });
});

describe("CategoryDetailView — close pick action", () => {
  it("renders the close button for an open pick when action is provided", () => {
    const pick = makePick({ closedAt: undefined });
    render(
      <CategoryDetailView
        category={makeCategory()}
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

  it("does not render the close button for a closed pick", () => {
    const pick = makePick({ closedAt: new Date("2025-02-01T09:00:00.000Z") });
    render(
      <CategoryDetailView
        category={makeCategory()}
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

  it("does not render the close button when no action is provided", () => {
    const pick = makePick({ closedAt: undefined });
    render(<CategoryDetailView category={makeCategory()} picks={[pick]} />);

    expect(
      screen.queryByRole("button", {
        name: CATEGORY_DETAIL_COPY.closePickButton,
      }),
    ).toBeNull();
  });
});

describe("CategoryDetailView — closed state", () => {
  it("renders a closed badge for a closed pick", () => {
    const pick = makePick({
      closedAt: new Date("2025-02-01T09:00:00.000Z"),
    });
    render(<CategoryDetailView category={makeCategory()} picks={[pick]} />);

    expect(screen.getByText(CATEGORY_DETAIL_COPY.closedBadge)).toBeDefined();
  });

  it("does not render a closed badge for an open pick", () => {
    const pick = makePick({ closedAt: undefined });
    render(<CategoryDetailView category={makeCategory()} picks={[pick]} />);

    expect(screen.queryByText(CATEGORY_DETAIL_COPY.closedBadge)).toBeNull();
  });
});

describe("CategoryDetailView — reopen pick action", () => {
  it("renders the reopen button for a closed pick", () => {
    const pick = makePick({
      id: "pick-closed",
      closedAt: new Date("2025-02-01T09:00:00.000Z"),
      closedManually: true,
    });
    render(<CategoryDetailView category={makeCategory()} picks={[pick]} />);

    expect(screen.getByTestId("reopen-pick-closed")).toBeDefined();
  });

  it("does not render the reopen button for an open pick", () => {
    const pick = makePick({ id: "pick-open" });
    render(<CategoryDetailView category={makeCategory()} picks={[pick]} />);

    expect(screen.queryByTestId("reopen-pick-open")).toBeNull();
  });
});
