import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { makeGroupWithActivity } from "@/lib/fixtures/groupActivity";

import { GroupListView } from "./GroupListView";

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
      makeGroupWithActivity(
        { id: "g1", name: "Friday Night Picks" },
        { activityPreview: 'New pick "Summer Blockbuster"', unreadCount: 2 },
      ),
      makeGroupWithActivity(
        { id: "g2", name: "Oscar Season 2024" },
        { activityPreview: "Closed: Best Picture", unreadCount: 0 },
      ),
      makeGroupWithActivity({ id: "g3", name: "Super Bowl Squares" }),
    ],
  },
};

export const SingleGroup: Story = {
  args: {
    groups: [makeGroupWithActivity({ id: "g1", name: "Friday Night Picks" })],
  },
};

export const WithUnreadBadge: Story = {
  args: {
    groups: [
      makeGroupWithActivity(
        { id: "g1", name: "Friday Night Picks" },
        { activityPreview: 'New pick "Summer Blockbuster"', unreadCount: 5 },
      ),
    ],
  },
};
