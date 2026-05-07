import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Category } from "@/lib/types/category";
import { CreatePickFormView } from "./CreatePickFormView";

const categories: Category[] = [
  {
    id: "cat-1",
    name: "Best Movies",
    description: "Vote on your favorite movies",
    groupId: "group-1",
    createdAt: new Date("2025-01-01T12:00:00.000Z"),
    creatorId: "user-1",
  },
  {
    id: "cat-2",
    name: "Top Albums",
    description: "Vote on your favorite albums",
    groupId: "group-1",
    createdAt: new Date("2025-01-02T12:00:00.000Z"),
    creatorId: "user-1",
  },
];

const meta: Meta<typeof CreatePickFormView> = {
  title: "Categories/CreatePickFormView",
  component: CreatePickFormView,
  args: {
    categories,
    categoryId: "cat-1",
    name: "",
    description: "",
    topCount: "3",
    dueDate: "",
    loading: false,
    error: undefined,
    onCategoryChange: () => undefined,
    onNameChange: () => undefined,
    onDescriptionChange: () => undefined,
    onTopCountChange: () => undefined,
    onDueDateChange: () => undefined,
    onSubmit: () => undefined,
    onCancel: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof CreatePickFormView>;

export const Empty: Story = {};

export const Filled: Story = {
  args: {
    name: "The Shawshank Redemption",
    description: "A classic film about hope",
    topCount: "5",
    dueDate: "2026-01-20",
  },
};

export const Loading: Story = {
  args: {
    name: "The Shawshank Redemption",
    topCount: "5",
    loading: true,
  },
};
