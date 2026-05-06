import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InviteLinkSectionView } from "./InviteLinkSectionView";
import { GROUP_DETAIL_COPY } from "./copy";

const meta: Meta<typeof InviteLinkSectionView> = {
  title: "Groups/InviteLinkSectionView",
  component: InviteLinkSectionView,
  args: {
    inviteUrl: "https://example.com/groups/join?token=abc123",
    expiresAt: null,
    expiryInput: "",
    copied: false,
    loading: false,
    error: undefined,
    onCopy: () => undefined,
    onExpiryChange: () => undefined,
    onSave: () => undefined,
    onClearExpiry: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof InviteLinkSectionView>;

export const NoExpiry: Story = {};

export const FutureExpiry: Story = {
  args: {
    expiresAt: "2099-12-31T00:00:00.000Z",
    expiryInput: "2099-12-31",
  },
};

export const ExpiredBadge: Story = {
  args: {
    expiresAt: "2020-01-01T00:00:00.000Z",
    expiryInput: "2020-01-01",
  },
};

export const Copied: Story = {
  args: {
    copied: true,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const WithError: Story = {
  args: {
    error: GROUP_DETAIL_COPY.errors.saveFailed,
  },
};
