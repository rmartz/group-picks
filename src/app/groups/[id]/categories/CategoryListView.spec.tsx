import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it } from "vitest";

import type { Category } from "@/lib/types/category";
import type { GroupPick } from "@/lib/types/pick";

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

function makePick(overrides?: Partial<GroupPick>): GroupPick {
  return {
    id: "pick-1",
    title: "Inception",
    topCount: 1,
    categoryId: "cat-1",
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
    groupId: "group-1",
    currentUserId: "user-1",
    showCreateForm: false,
    editingId: undefined,
    createName: "",
    createDescription: "",
    editName: "",
    editDescription: "",
    loading: false,
    error: undefined,
    picksByCategory: {},
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

  describe("category name links to category detail", () => {
    it("renders category name as a link", () => {
      render(
        <CategoryListView
          {...makeProps({ categories: [makeCategory({ id: "cat-1" })] })}
        />,
      );

      const link = screen.getByRole("link", { name: "Best Movies" });
      expect(link).toBeDefined();
      expect((link as HTMLAnchorElement).href).toContain(
        "/groups/group-1/categories/cat-1",
      );
    });
  });

  describe("pick list within each category", () => {
    it("shows no-picks message when category has no picks", () => {
      render(
        <CategoryListView
          {...makeProps({
            categories: [makeCategory({ id: "cat-1" })],
            picksByCategory: { "cat-1": [] },
          })}
        />,
      );

      expect(screen.getByText(CATEGORY_COPY.noPicksMessage)).toBeDefined();
    });

    it("renders pick titles within category", () => {
      render(
        <CategoryListView
          {...makeProps({
            categories: [makeCategory({ id: "cat-1" })],
            picksByCategory: {
              "cat-1": [makePick({ id: "pick-1", title: "Inception" })],
            },
          })}
        />,
      );

      expect(screen.getByText("Inception")).toBeDefined();
    });

    it("renders each pick as a link to pick detail", () => {
      render(
        <CategoryListView
          {...makeProps({
            categories: [makeCategory({ id: "cat-1" })],
            picksByCategory: {
              "cat-1": [makePick({ id: "pick-1", title: "Inception" })],
            },
          })}
        />,
      );

      const link = screen.getByRole("link", { name: "Inception" });
      expect((link as HTMLAnchorElement).href).toContain(
        "/groups/group-1/categories/cat-1/picks/pick-1",
      );
    });

    it("renders a closed badge for a closed pick", () => {
      render(
        <CategoryListView
          {...makeProps({
            categories: [makeCategory({ id: "cat-1" })],
            picksByCategory: {
              "cat-1": [
                makePick({ closedAt: new Date("2025-02-01T09:00:00.000Z") }),
              ],
            },
          })}
        />,
      );

      expect(screen.getByText(CATEGORY_COPY.closedBadge)).toBeDefined();
    });

    it("renders an open badge for an open pick", () => {
      render(
        <CategoryListView
          {...makeProps({
            categories: [makeCategory({ id: "cat-1" })],
            picksByCategory: {
              "cat-1": [makePick({ closedAt: undefined })],
            },
          })}
        />,
      );

      expect(screen.getByText(CATEGORY_COPY.openBadge)).toBeDefined();
    });

    it("renders the formatted due date when dueDate is set", () => {
      const dueDate = new Date("2026-01-01T00:00:00.000Z");
      render(
        <CategoryListView
          {...makeProps({
            categories: [makeCategory({ id: "cat-1" })],
            picksByCategory: {
              "cat-1": [makePick({ dueDate })],
            },
          })}
        />,
      );

      expect(screen.getByText(dueDate.toLocaleDateString())).toBeDefined();
    });

    it("does not render due date when dueDate is absent", () => {
      render(
        <CategoryListView
          {...makeProps({
            categories: [makeCategory({ id: "cat-1" })],
            picksByCategory: {
              "cat-1": [makePick({ dueDate: undefined })],
            },
          })}
        />,
      );

      expect(
        screen.queryByText(
          new Date("2026-01-01T00:00:00.000Z").toLocaleDateString(),
        ),
      ).toBeNull();
    });
  });

  describe('"Create pick" CTA', () => {
    it("renders a create pick link within each category", () => {
      render(
        <CategoryListView
          {...makeProps({
            categories: [makeCategory({ id: "cat-1" })],
          })}
        />,
      );

      const link = screen.getByRole("link", {
        name: CATEGORY_COPY.createPickButton,
      });
      expect((link as HTMLAnchorElement).href).toContain(
        "/groups/group-1/categories/cat-1/picks/new",
      );
    });
  });

  describe("canCreatePick prop controls Create Pick visibility", () => {
    it("shows Create Pick link when canCreatePick is true", () => {
      render(
        <CategoryListView
          {...makeProps({
            categories: [makeCategory({ id: "cat-1" })],
            canCreatePick: true,
          })}
        />,
      );
      expect(
        screen.getByRole("link", { name: CATEGORY_COPY.createPickButton }),
      ).toBeDefined();
    });

    it("hides Create Pick link when canCreatePick is false", () => {
      render(
        <CategoryListView
          {...makeProps({
            categories: [makeCategory({ id: "cat-1" })],
            canCreatePick: false,
          })}
        />,
      );
      expect(
        screen.queryByRole("link", { name: CATEGORY_COPY.createPickButton }),
      ).toBeNull();
    });
  });
});
