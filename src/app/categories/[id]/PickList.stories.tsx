import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PickList } from "./PickList";

const meta: Meta<typeof PickList> = {
  title: "Categories/PickList",
  component: PickList,
  args: {
    groupId: "group-1",
    categoryId: "cat-1",
    initialPicks: [
      {
        id: "pick-1",
        title: "The Shawshank Redemption",
        description: "A classic film about hope",
        topCount: 3,
        dueDate: new Date("2025-03-10T12:00:00.000Z"),
        categoryId: "cat-1",
        createdAt: new Date("2025-01-20T12:00:00.000Z"),
        creatorId: "user-123",
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof PickList>;

export const Default: Story = {};

export const EmptyState: Story = {
  args: {
    initialPicks: [],
  },
};
