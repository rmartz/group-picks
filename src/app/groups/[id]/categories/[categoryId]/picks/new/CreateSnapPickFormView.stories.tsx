import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CreateSnapPickFormView } from "./CreateSnapPickFormView";

const noop = () => undefined;

const meta: Meta<typeof CreateSnapPickFormView> = {
  title: "Picks/CreateSnapPickFormView",
  component: CreateSnapPickFormView,
  args: {
    title: "",
    onTitleChange: noop,
    onSubmit: noop,
    onCancel: noop,
    loading: false,
    error: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof CreateSnapPickFormView>;

export const Default: Story = {};

export const WithTitle: Story = {
  args: {
    title: "What's for dinner?",
  },
};

export const Loading: Story = {
  args: {
    title: "What's for dinner?",
    loading: true,
  },
};

export const WithError: Story = {
  args: {
    error: "Could not create the Snap Pick. Please try again.",
  },
};
