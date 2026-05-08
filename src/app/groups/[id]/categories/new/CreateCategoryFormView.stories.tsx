import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CreateCategoryFormView } from "./CreateCategoryFormView";
import { CREATE_CATEGORY_COPY } from "./copy";

const meta: Meta<typeof CreateCategoryFormView> = {
  title: "Categories/CreateCategoryFormView",
  component: CreateCategoryFormView,
  args: {
    name: "Best Movies",
    description: "Vote on your favorite movies of all time",
    onNameChange: () => undefined,
    onDescriptionChange: () => undefined,
    onSubmit: () => undefined,
    loading: false,
    error: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof CreateCategoryFormView>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const WithError: Story = {
  args: {
    error: CREATE_CATEGORY_COPY.errors.default,
  },
};
