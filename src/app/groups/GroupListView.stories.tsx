import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { makeGroup } from "@/lib/fixtures/group";

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
      makeGroup({ id: "g1", name: "Friday Night Picks" }),
      makeGroup({ id: "g2", name: "Oscar Season 2024" }),
      makeGroup({ id: "g3", name: "Super Bowl Squares" }),
    ],
  },
};

export const SingleGroup: Story = {
  args: {
    groups: [makeGroup({ id: "g1", name: "Friday Night Picks" })],
  },
};
