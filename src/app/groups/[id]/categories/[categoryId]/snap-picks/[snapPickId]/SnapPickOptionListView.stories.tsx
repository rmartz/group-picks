import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { makeSnapPickOption } from "@/lib/fixtures/snap-pick";

import { SnapPickOptionListView } from "./SnapPickOptionListView";

const meta = {
  title: "SnapPicks/SnapPickOptionListView",
  component: SnapPickOptionListView,
  args: {
    currentUserId: "user-1",
    newTitle: "",
    loading: false,
    error: undefined,
    onNewTitleChange: () => undefined,
    onAddSubmit: () => undefined,
    onRemove: () => undefined,
    options: [
      makeSnapPickOption({ id: "option-1", title: "Pizza", addedBy: "user-1" }),
      makeSnapPickOption({ id: "option-2", title: "Tacos", addedBy: "user-2" }),
    ],
  },
} satisfies Meta<typeof SnapPickOptionListView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    options: [],
  },
};

export const WithError: Story = {
  args: {
    error: "Something went wrong. Please try again.",
  },
};
