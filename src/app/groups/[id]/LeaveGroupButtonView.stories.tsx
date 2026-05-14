import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { GROUP_DETAIL_COPY } from "./copy";
import { LeaveGroupButtonView } from "./LeaveGroupButtonView";

const noop = () => undefined;

const meta: Meta<typeof LeaveGroupButtonView> = {
  title: "Groups/LeaveGroupButtonView",
  component: LeaveGroupButtonView,
  args: {
    onLeave: noop,
    isLeaving: false,
    error: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof LeaveGroupButtonView>;

export const Default: Story = {};

export const Leaving: Story = {
  args: {
    isLeaving: true,
  },
};

export const LastMemberError: Story = {
  args: {
    error: GROUP_DETAIL_COPY.errors.lastMember,
  },
};

export const DefaultError: Story = {
  args: {
    error: GROUP_DETAIL_COPY.errors.default,
  },
};
