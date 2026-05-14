import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CATEGORY_COPY } from "./copy";
import { EditCategoryFormView } from "./EditCategoryFormView";

const meta: Meta<typeof EditCategoryFormView> = {
  title: "Categories/EditCategoryFormView",
  component: EditCategoryFormView,
  args: {
    name: "Best Movies",
    description: "Vote on your favorite movies of all time",
    onNameChange: () => undefined,
    onDescriptionChange: () => undefined,
    onSubmit: () => undefined,
    onCancel: () => undefined,
    loading: false,
    error: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof EditCategoryFormView>;

export const Default: Story = {};

export const NoDescription: Story = {
  args: {
    description: "",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const WithError: Story = {
  args: {
    error: CATEGORY_COPY.errors.default,
  },
};
