import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GroupListView } from "./GroupListView";

function makeGroup(id: string, name: string) {
  return {
    id,
    name,
    createdAt: new Date("2024-01-15"),
    creatorId: "user-1",
    memberIds: ["user-1"],
  };
}

const meta: Meta<typeof GroupListView> = {
  title: "Groups/GroupListView",
  component: GroupListView,
};

export default meta;
type Story = StoryObj<typeof GroupListView>;

export const Empty: Story = {
  args: {
    groups: [],
  },
};

export const WithGroups: Story = {
  args: {
    groups: [
      makeGroup("g1", "Friday Night Picks"),
      makeGroup("g2", "Oscar Season 2024"),
      makeGroup("g3", "Super Bowl Squares"),
    ],
  },
};

export const SingleGroup: Story = {
  args: {
    groups: [makeGroup("g1", "Friday Night Picks")],
  },
};
