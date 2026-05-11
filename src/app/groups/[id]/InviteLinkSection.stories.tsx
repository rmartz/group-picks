import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InviteLinkSectionView } from "./InviteLinkSectionView";

const noop = () => undefined;

const meta: Meta<typeof InviteLinkSectionView> = {
  title: "Groups/InviteLinkSectionView",
  component: InviteLinkSectionView,
  args: {
    inviteUrl: "https://group-picks.example.com/invite/tok-mock-abc123",
    copied: false,
    onCopy: noop,
  },
};

export default meta;
type Story = StoryObj<typeof InviteLinkSectionView>;

export const Default: Story = {};

export const Copied: Story = {
  args: {
    copied: true,
  },
};

export const LongUrl: Story = {
  args: {
    inviteUrl:
      "https://group-picks.example.com/invite/tok-00000000-0000-0000-0000-000000000000",
  },
};
