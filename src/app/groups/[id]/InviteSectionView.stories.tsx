import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { GROUP_DETAIL_COPY } from "./copy";
import { InviteSectionView } from "./InviteSectionView";

const INVITE_URL = "https://example.com/groups/join?token=abc123token";

const meta: Meta<typeof InviteSectionView> = {
  title: "Groups/InviteSectionView",
  component: InviteSectionView,
  args: {
    inviteUrl: INVITE_URL,
    expiresAt: new Date("2026-05-13T12:00:00.000Z"),
    onRegenerate: () => undefined,
    onCopy: () => undefined,
    regenerating: false,
    copied: false,
    error: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof InviteSectionView>;

export const Default: Story = {};

export const NoToken: Story = {
  args: {
    inviteUrl: undefined,
    expiresAt: undefined,
  },
};

export const Copied: Story = {
  args: {
    copied: true,
  },
};

export const Regenerating: Story = {
  args: {
    regenerating: true,
  },
};

export const WithError: Story = {
  args: {
    error: GROUP_DETAIL_COPY.inviteErrors.default,
  },
};
