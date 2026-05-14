import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { JoinGroupFormView } from "./JoinGroupFormView";
import { JOIN_GROUP_COPY } from "./copy";

const meta: Meta<typeof JoinGroupFormView> = {
  title: "Groups/JoinGroupFormView",
  component: JoinGroupFormView,
  args: {
    groupName: "Book Club",
    onJoin: () => undefined,
    loading: false,
    error: undefined,
    onSignInDifferentAccount: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof JoinGroupFormView>;

export const Default: Story = {};

export const WithMemberCount: Story = {
  args: {
    memberCount: 7,
  },
};

export const SingleMember: Story = {
  args: {
    memberCount: 1,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const WithError: Story = {
  args: {
    error: JOIN_GROUP_COPY.errors.default,
  },
};
