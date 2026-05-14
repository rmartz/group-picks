import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { Category } from "@/lib/types/category";

import { CategoryListView } from "./CategoryListView";
import { CATEGORY_LIST_COPY } from "./copy";

const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Best Movie",
    groupId: "group-1",
    createdAt: new Date("2024-01-01"),
    creatorId: "user-1",
  },
  {
    id: "cat-2",
    name: "Favorite Book",
    groupId: "group-1",
    createdAt: new Date("2024-01-02"),
    creatorId: "user-1",
  },
];

const meta: Meta<typeof CategoryListView> = {
  title: "Groups/CategoryListView",
  component: CategoryListView,
  args: {
    categories: mockCategories,
    onDeleteCategory: () => undefined,
    deletingId: undefined,
    deleteError: undefined,
    newCategoryName: "",
    onNewCategoryNameChange: () => undefined,
    onAddCategory: () => undefined,
    adding: false,
    addError: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof CategoryListView>;

export const Empty: Story = {
  args: {
    categories: [],
  },
};

export const Populated: Story = {};

export const Deleting: Story = {
  args: {
    deletingId: "cat-1",
  },
};

export const DeleteError: Story = {
  args: {
    deleteError: CATEGORY_LIST_COPY.errors.delete,
  },
};

export const DeleteErrorHasPicks: Story = {
  args: {
    deleteError: CATEGORY_LIST_COPY.errors.hasPicks,
  },
};

export const Adding: Story = {
  args: {
    newCategoryName: "Best Song",
    adding: true,
  },
};

export const AddError: Story = {
  args: {
    newCategoryName: "Best Song",
    addError: CATEGORY_LIST_COPY.errors.create,
  },
};
