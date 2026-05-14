import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NoGroupsView } from "./NoGroupsView";

const meta: Meta<typeof NoGroupsView> = {
  title: "Groups/NoGroupsView",
  component: NoGroupsView,
};

export default meta;
type Story = StoryObj<typeof NoGroupsView>;

export const Default: Story = {};
