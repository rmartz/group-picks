import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Category } from "@/lib/types/category";
import type { GroupPick } from "@/lib/types/pick";
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

const mockPicks: GroupPick[] = [
  {
    id: "pick-1",
    title: "The Godfather",
    topCount: 3,
    categoryId: "cat-1",
    createdAt: new Date("2024-01-10"),
    creatorId: "user-1",
  },
  {
    id: "pick-2",
    title: "Inception",
    topCount: 2,
    categoryId: "cat-1",
    createdAt: new Date("2024-01-11"),
    creatorId: "user-2",
  },
];

const noopCategory = () => undefined;

const meta: Meta<typeof CategoryListView> = {
  title: "Categories/CategoryListView",
  component: CategoryListView,
  args: {
    categories: mockCategories,
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
    onStartCreate: () => undefined,
    onCancelCreate: () => undefined,
    onStartEdit: noopCategory,
    onCancelEdit: () => undefined,
    onCreateNameChange: () => undefined,
    onCreateDescriptionChange: () => undefined,
    onEditNameChange: () => undefined,
    onEditDescriptionChange: () => undefined,
    onCreateSubmit: () => undefined,
    onEditSubmit: () => undefined,
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

export const WithPicks: Story = {
  args: {
    picksByCategory: { "cat-1": mockPicks },
  },
};
