import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CategoryDetailView } from "./CategoryDetailView";
import { CATEGORY_DETAIL_COPY } from "./copy";

afterEach(cleanup);

function makeCategory() {
  return {
    id: "cat-1",
    groupId: "group-1",
    name: "Best Movies",
    description: "Vote on the best movies",
    createdAt: new Date("2025-06-15T12:00:00.000Z"),
    creatorId: "user-1",
  };
}

describe("CategoryDetailView", () => {
  it("renders the category name as a heading", () => {
    render(<CategoryDetailView category={makeCategory()} />);

    expect(screen.getByText("Best Movies")).toBeDefined();
  });

  it("renders the created at label", () => {
    render(<CategoryDetailView category={makeCategory()} />);

    expect(
      screen.getByText(CATEGORY_DETAIL_COPY.createdAtLabel + ":"),
    ).toBeDefined();
  });

  it("renders the formatted created at date", () => {
    const category = makeCategory();
    render(<CategoryDetailView category={category} />);

    expect(
      screen.getByText(category.createdAt.toLocaleDateString()),
    ).toBeDefined();
  });
});
