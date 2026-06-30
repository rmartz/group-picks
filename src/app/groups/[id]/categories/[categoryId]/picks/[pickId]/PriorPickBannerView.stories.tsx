import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RankingTier } from "@/lib/types/ranking";

import { PriorPickBannerView } from "./PriorPickBannerView";

const meta: Meta<typeof PriorPickBannerView> = {
  title: "Picks/PriorPickBannerView",
  component: PriorPickBannerView,
  args: {
    categoryName: "Movies",
    pickTitle: "Best of 2024",
    rankedAt: new Date("2024-06-01T00:00:00.000Z"),
    overlappingCount: 5,
    prefillAssignments: {
      "opt-1": RankingTier.LoveIt,
      "opt-2": RankingTier.Yes,
      "opt-3": RankingTier.Maybe,
      "opt-4": RankingTier.NotForMe,
      "opt-5": RankingTier.Unranked,
    },
    onPrefill: () => undefined,
    onStartFresh: () => undefined,
    onDismiss: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof PriorPickBannerView>;

export const Default: Story = {};

export const FewOverlapping: Story = {
  args: {
    overlappingCount: 1,
    prefillAssignments: { "opt-1": RankingTier.LoveIt },
  },
};
