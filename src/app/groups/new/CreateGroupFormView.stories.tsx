import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CREATE_GROUP_COPY } from "./copy";
import { CreateGroupFormView } from "./CreateGroupFormView";

const meta: Meta<typeof CreateGroupFormView> = {
  title: "Groups/CreateGroupFormView",
  component: CreateGroupFormView,
  args: {
    name: "",
    onNameChange: () => undefined,
    onSubmit: (e) => {
      e.preventDefault();
    },
    onCancel: () => undefined,
    loading: false,
    error: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof CreateGroupFormView>;

export const Default: Story = {};

export const WithName: Story = {
  args: {
    name: "Friday Night Picks",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    name: "Friday Night Picks",
  },
};

export const WithError: Story = {
  args: {
    error: CREATE_GROUP_COPY.errors.default,
  },
};
