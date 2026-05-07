import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Category } from "@/lib/types/category";
import { CategoryListView } from "./CategoryListView";
import { CATEGORY_COPY } from "./copy";

const mockCategories: Category[] = [
  {
    id: "cat-1",
    groupId: "group-1",
    name: "Best Movies",
    description: "Vote on your favorite movies of all time",
    createdAt: new Date("2024-01-01"),
    creatorId: "user-1",
  },
  {
    id: "cat-2",
    groupId: "group-1",
    name: "Top Albums",
    description: "",
    createdAt: new Date("2024-01-02"),
    creatorId: "user-1",
  },
];

const noopCategory = () => undefined;

const meta: Meta<typeof CategoryListView> = {
  title: "Categories/CategoryListView",
  component: CategoryListView,
  args: {
    categories: mockCategories,
    showCreateForm: false,
    editingId: undefined,
    createName: "",
    createDescription: "",
    editName: "",
    editDescription: "",
    loading: false,
    error: undefined,
    showCreatePickForCategoryId: undefined,
    createPickCategoryId: "cat-1",
    createPickName: "",
    createPickDescription: "",
    createPickTopCount: "3",
    createPickDueDate: "",
    pickLoading: false,
    pickError: undefined,
    onStartCreate: () => undefined,
    onCancelCreate: () => undefined,
    onStartCreatePick: () => undefined,
    onCancelCreatePick: () => undefined,
    onStartEdit: noopCategory,
    onCancelEdit: () => undefined,
    onCreateNameChange: () => undefined,
    onCreateDescriptionChange: () => undefined,
    onEditNameChange: () => undefined,
    onEditDescriptionChange: () => undefined,
    onCreatePickCategoryChange: () => undefined,
    onCreatePickNameChange: () => undefined,
    onCreatePickDescriptionChange: () => undefined,
    onCreatePickTopCountChange: () => undefined,
    onCreatePickDueDateChange: () => undefined,
    onCreateSubmit: () => undefined,
    onEditSubmit: () => undefined,
    onCreatePickSubmit: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof CategoryListView>;

export const WithCategories: Story = {};

export const EmptyList: Story = {
  args: {
    categories: [],
  },
};

export const CreateFormOpen: Story = {
  args: {
    categories: mockCategories,
    showCreateForm: true,
  },
};

export const EditFormOpen: Story = {
  args: {
    editingId: "cat-1",
    editName: "Best Movies",
    editDescription: "Vote on your favorite movies of all time",
  },
};

export const CreatePickFormOpen: Story = {
  args: {
    showCreatePickForCategoryId: "cat-1",
    createPickCategoryId: "cat-1",
    createPickName: "Greatest Movie",
    createPickTopCount: "5",
  },
};

export const LoadingCreate: Story = {
  args: {
    showCreateForm: true,
    createName: "Best Movies",
    createDescription: "Vote on your favorite movies",
    loading: true,
  },
};

export const LoadingEdit: Story = {
  args: {
    editingId: "cat-1",
    editName: "Best Movies",
    editDescription: "Vote on your favorite movies of all time",
    loading: true,
  },
};

export const CreateError: Story = {
  args: {
    showCreateForm: true,
    createName: "Best Movies",
    error: CATEGORY_COPY.errors.default,
  },
};

export const EditError: Story = {
  args: {
    editingId: "cat-1",
    editName: "Best Movies",
    editDescription: "",
    error: CATEGORY_COPY.errors.default,
  },
};
