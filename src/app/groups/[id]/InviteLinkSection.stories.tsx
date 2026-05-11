// Superseded by InviteSectionView.stories.tsx (this PR). File retained as
// a placeholder because the agent could not delete it; clean up in a
// follow-up.
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

function PlaceholderInviteLinkSectionView() {
  return null;
}

const meta: Meta<typeof PlaceholderInviteLinkSectionView> = {
  title: "Groups/InviteLinkSectionView (superseded)",
  component: PlaceholderInviteLinkSectionView,
  parameters: {
    docs: { disable: true },
  },
};

export default meta;
type Story = StoryObj<typeof PlaceholderInviteLinkSectionView>;

export const Placeholder: Story = {};
