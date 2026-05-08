import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GroupDetailView } from "./GroupDetailView";

const meta: Meta<typeof GroupDetailView> = {
  title: "Groups/GroupDetailView",
  component: GroupDetailView,
  args: {
    group: {
      id: "group-1",
      name: "Friday Night Picks",
      createdAt: new Date("2025-01-15T12:00:00.000Z"),
      creatorId: "user-123",
      memberIds: ["user-123", "user-456", "user-789"],
      adminIds: ["user-123"],
      picksRestricted: false,
    },
    categories: [],
    currentUserId: "user-123",
  },
};

export default meta;
type Story = StoryObj<typeof GroupDetailView>;

export const Default: Story = {};
