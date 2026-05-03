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
    },
    members: [
      { uid: "user-123", name: "Alice" },
      { uid: "user-456", name: "Bob" },
      { uid: "user-789", name: "Carol" },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof GroupDetailView>;

export const Default: Story = {};

export const SingleMember: Story = {
  args: {
    members: [{ uid: "user-123", name: "Alice" }],
  },
};

export const ManyMembers: Story = {
  args: {
    members: Array.from({ length: 10 }, (_, i) => ({
      uid: `user-${i}`,
      name: `Member ${i + 1}`,
    })),
  },
};
