import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CreateCategoryFormView } from "./CreateCategoryFormView";
import { CATEGORY_COPY } from "./copy";

const meta: Meta<typeof CreateCategoryFormView> = {
  title: "Categories/CreateCategoryFormView",
  component: CreateCategoryFormView,
  args: {
    name: "",
    description: "",
    onNameChange: () => undefined,
    onDescriptionChange: () => undefined,
    onSubmit: () => undefined,
    onCancel: () => undefined,
    loading: false,
    error: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof CreateCategoryFormView>;

export const Empty: Story = {};

export const Filled: Story = {
  args: {
    name: "Best Movies",
    description: "Vote on your favorite movies of all time",
  },
};

export const Loading: Story = {
  args: {
    name: "Best Movies",
    description: "Vote on your favorite movies",
    loading: true,
  },
};

export const WithError: Story = {
  args: {
    name: "Best Movies",
    description: "",
    error: CATEGORY_COPY.errors.default,
  },
};
