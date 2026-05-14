import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Option } from "@/lib/types/option";
import { RankingTier } from "./TierRanking.copy";
import { TierRankingView } from "./TierRankingView";

const mockOptions: Option[] = [
  {
    id: "opt-1",
    title: "The Shawshank Redemption",
    pickId: "pick-1",
    ownerIds: ["user-1"],
  },
  { id: "opt-2", title: "Inception", pickId: "pick-1", ownerIds: ["user-1"] },
  {
    id: "opt-3",
    title: "Interstellar",
    pickId: "pick-1",
    ownerIds: ["user-1"],
  },
  { id: "opt-4", title: "The Matrix", pickId: "pick-1", ownerIds: ["user-1"] },
  { id: "opt-5", title: "Parasite", pickId: "pick-1", ownerIds: ["user-1"] },
];

const meta: Meta<typeof TierRankingView> = {
  title: "Picks/TierRankingView",
  component: TierRankingView,
  args: {
    options: mockOptions,
    tierAssignments: {},
    onOptionClick: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof TierRankingView>;

export const AllUnranked: Story = {};

export const MixedTiers: Story = {
  args: {
    tierAssignments: {
      "opt-1": RankingTier.LoveIt,
      "opt-2": RankingTier.Yes,
      "opt-3": RankingTier.Maybe,
      "opt-4": RankingTier.NotReally,
    },
  },
};

export const Empty: Story = {
  args: {
    options: [],
  },
};
