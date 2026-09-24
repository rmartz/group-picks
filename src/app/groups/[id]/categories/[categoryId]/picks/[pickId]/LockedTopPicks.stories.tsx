import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LockedTopPicks } from "./LockedTopPicks";

const now = new Date("2025-06-01T00:00:00.000Z");

const meta: Meta<typeof LockedTopPicks> = {
  title: "Picks/LockedTopPicks",
  component: LockedTopPicks,
  args: {
    rankedCount: 3,
    memberCount: 5,
    dueDate: new Date("2025-06-04T09:00:00.000Z"),
    now,
  },
};

export default meta;
type Story = StoryObj<typeof LockedTopPicks>;

export const Default: Story = {};

export const AllMembersRanked: Story = {
  args: {
    rankedCount: 5,
    memberCount: 5,
  },
};

export const NoneRankedYet: Story = {
  args: {
    rankedCount: 0,
    memberCount: 5,
  },
};

export const ClosingSoon: Story = {
  args: {
    dueDate: new Date("2025-06-01T03:00:00.000Z"),
  },
};

export const NoDueDate: Story = {
  args: {
    dueDate: undefined,
  },
};
