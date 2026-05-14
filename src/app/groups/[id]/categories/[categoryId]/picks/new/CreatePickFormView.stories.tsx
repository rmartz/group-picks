import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CreatePickFormView } from "./CreatePickFormView";

const meta: Meta<typeof CreatePickFormView> = {
  title: "Picks/CreatePickFormView",
  component: CreatePickFormView,
  args: {
    title: "",
    onTitleChange: () => undefined,
    topCount: 3,
    onTopCountChange: () => undefined,
    dueDate: "",
    onDueDateChange: () => undefined,
    hasPriorPicks: false,
    onSubmit: () => undefined,
    onCancel: () => undefined,
    loading: false,
    error: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof CreatePickFormView>;

export const Default: Story = {};

export const WithPriorPicks: Story = {
  args: {
    hasPriorPicks: true,
  },
};

export const WithTitle: Story = {
  args: {
    title: "Best Movies of 2025",
    topCount: 3,
  },
};

export const Loading: Story = {
  args: {
    title: "Best Movies of 2025",
    loading: true,
  },
};

export const WithError: Story = {
  args: {
    title: "Best Movies of 2025",
    error: "Something went wrong. Please try again.",
  },
};
