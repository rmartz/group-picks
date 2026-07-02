import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ActiveSnapPickListView } from "./ActiveSnapPickListView";

const meta: Meta<typeof ActiveSnapPickListView> = {
  title: "Groups/ActiveSnapPickListView",
  component: ActiveSnapPickListView,
  args: {
    items: [
      {
        activationId: "activation-1",
        title: "Where should we eat tonight?",
        categoryName: "Dinner",
        timeRemainingLabel: "Closes in 2h 15m",
        href: "/groups/group-1/categories/cat-1/snap-picks/snap-1",
      },
      {
        activationId: "activation-2",
        title: "Which movie?",
        categoryName: "Movie night",
        timeRemainingLabel: "Closes in 40m",
        href: "/groups/group-1/categories/cat-2/snap-picks/snap-2",
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof ActiveSnapPickListView>;

export const Default: Story = {};

export const WithoutCategoryName: Story = {
  args: {
    items: [
      {
        activationId: "activation-3",
        title: "Weekend hike?",
        categoryName: undefined,
        timeRemainingLabel: "Closes in 5h 3m",
        href: "/groups/group-1/categories/cat-3/snap-picks/snap-3",
      },
    ],
  },
};
