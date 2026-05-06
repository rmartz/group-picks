import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { CategoryListView } from "./CategoryListView";
import { CATEGORY_LIST_COPY } from "./copy";
import type { Category } from "@/lib/types/category";

afterEach(cleanup);

function makeCategory(overrides?: Partial<Category>): Category {
  return {
    id: "cat-1",
    groupId: "group-1",
    name: "Best Movie",
    createdAt: new Date("2025-03-10T09:00:00.000Z"),
    ...overrides,
  };
}

function renderView(
  overrides?: Partial<Parameters<typeof CategoryListView>[0]>,
) {
  const defaults = {
    categories: [],
    onDeleteCategory: vi.fn(),
    deletingId: undefined,
    deleteError: undefined,
    newCategoryName: "",
    onNewCategoryNameChange: vi.fn(),
    onAddCategory: vi.fn(),
    adding: false,
    addError: undefined,
  };
  return render(<CategoryListView {...defaults} {...overrides} />);
}

describe("CategoryListView", () => {
  it("renders the section title", () => {
    renderView();
    expect(screen.getByText(CATEGORY_LIST_COPY.title)).toBeDefined();
  });

  it("renders empty message when no categories", () => {
    renderView({ categories: [] });
    expect(screen.getByText(CATEGORY_LIST_COPY.empty)).toBeDefined();
  });

  it("renders category names", () => {
    const categories = [
      makeCategory({ id: "cat-1", name: "Best Movie" }),
      makeCategory({ id: "cat-2", name: "Best Song" }),
    ];
    renderView({ categories });
    expect(screen.getByText("Best Movie")).toBeDefined();
    expect(screen.getByText("Best Song")).toBeDefined();
  });

  it("renders a delete button for each category", () => {
    const categories = [makeCategory({ id: "cat-1", name: "Best Movie" })];
    renderView({ categories });
    expect(
      screen.getByRole("button", {
        name: `${CATEGORY_LIST_COPY.deleteButton} Best Movie`,
      }),
    ).toBeDefined();
  });

  it("calls onDeleteCategory when delete button is clicked", () => {
    const onDeleteCategory = vi.fn();
    const categories = [makeCategory({ id: "cat-42", name: "Best Movie" })];
    renderView({ categories, onDeleteCategory });

    fireEvent.click(
      screen.getByRole("button", {
        name: `${CATEGORY_LIST_COPY.deleteButton} Best Movie`,
      }),
    );

    expect(onDeleteCategory).toHaveBeenCalledWith("cat-42");
  });

  it("shows deleting state for the category being deleted", () => {
    const categories = [makeCategory({ id: "cat-1", name: "Best Movie" })];
    renderView({ categories, deletingId: "cat-1" });
    expect(screen.getByText(CATEGORY_LIST_COPY.deletingButton)).toBeDefined();
  });

  it("renders a delete error message", () => {
    renderView({ deleteError: CATEGORY_LIST_COPY.errors.delete });
    expect(screen.getByText(CATEGORY_LIST_COPY.errors.delete)).toBeDefined();
  });

  it("renders the add category form", () => {
    renderView();
    expect(
      screen.getByPlaceholderText(CATEGORY_LIST_COPY.addCategoryPlaceholder),
    ).toBeDefined();
    expect(screen.getByText(CATEGORY_LIST_COPY.addButton)).toBeDefined();
  });

  it("shows adding state on the add button", () => {
    renderView({ adding: true });
    expect(screen.getByText(CATEGORY_LIST_COPY.addingButton)).toBeDefined();
  });

  it("renders an add error message", () => {
    renderView({ addError: CATEGORY_LIST_COPY.errors.create });
    expect(screen.getByText(CATEGORY_LIST_COPY.errors.create)).toBeDefined();
  });
});
