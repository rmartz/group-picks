import { afterEach, describe, expect, it } from "vitest";
import type { ComponentProps } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import type { Category } from "@/lib/types/category";
import { CategoryListView } from "./CategoryListView";
import { CATEGORY_COPY } from "./copy";

afterEach(cleanup);

const noop = () => undefined;

function makeCategory(overrides?: Partial<Category>): Category {
  return {
    id: "cat-1",
    name: "Best Movies",
    description: "Pick your favourite movie",
    groupId: "group-1",
    createdAt: new Date("2025-01-15T12:00:00.000Z"),
    creatorId: "user-1",
    ...overrides,
  };
}

function makeProps(
  overrides?: Partial<ComponentProps<typeof CategoryListView>>,
) {
  return {
    categories: [],
    currentUserId: "user-1",
    showCreateForm: false,
    editingId: undefined,
    createName: "",
    createDescription: "",
    editName: "",
    editDescription: "",
    loading: false,
    error: undefined,
    onStartCreate: noop,
    onCancelCreate: noop,
    onStartEdit: noop,
    onCancelEdit: noop,
    onCreateNameChange: noop,
    onCreateDescriptionChange: noop,
    onEditNameChange: noop,
    onEditDescriptionChange: noop,
    onCreateSubmit: noop,
    onEditSubmit: noop,
    ...overrides,
  };
}

describe("CategoryListView", () => {
  it("shows edit for categories created by the current user", () => {
    render(
      <CategoryListView {...makeProps({ categories: [makeCategory()] })} />,
    );

    expect(
      screen.getByRole("button", { name: CATEGORY_COPY.editButton }),
    ).toBeDefined();
  });

  it("hides edit for categories created by other users", () => {
    render(
      <CategoryListView
        {...makeProps({
          categories: [makeCategory({ creatorId: "user-2" })],
        })}
      />,
    );

    expect(
      screen.queryByRole("button", { name: CATEGORY_COPY.editButton }),
    ).toBeNull();
  });
});
