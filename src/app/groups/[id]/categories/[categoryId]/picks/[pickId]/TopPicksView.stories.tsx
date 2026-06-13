import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { Option } from "@/lib/types/option";
import { RankingTier } from "@/lib/types/ranking";

import { TopPicksView } from "./TopPicksView";

const mockOptions: Option[] = [
  {
    id: "opt-1",
    title: "The Shawshank Redemption",
    pickId: "pick-1",
    ownerIds: ["user-1"],
  },
  { id: "opt-2", title: "Inception", pickId: "pick-1", ownerIds: ["user-2"] },
  {
    id: "opt-3",
    title: "Interstellar",
    pickId: "pick-1",
    ownerIds: ["user-1"],
  },
];

const meta: Meta<typeof TopPicksView> = {
  title: "Picks/TopPicksView",
  component: TopPicksView,
  args: {
    isOpen: false,
    topPicks: mockOptions,
    topCount: 3,
  },
};

export default meta;
type Story = StoryObj<typeof TopPicksView>;

export const Locked: Story = {
  args: {
    isOpen: true,
    topPicks: [],
  },
};

export const EmptyResults: Story = {
  args: {
    isOpen: false,
    topPicks: [],
  },
};

export const RevealedList: Story = {
  args: {
    topPickAttribution: {
      "opt-1": {
        [RankingTier.LoveIt]: [
          { uid: "user-1", firstName: "Alice" },
          { uid: "user-2", firstName: "Bob" },
        ],
        [RankingTier.Yes]: [{ uid: "user-3", firstName: "Carol" }],
        [RankingTier.Maybe]: [],
        [RankingTier.NotForMe]: [],
        noRank: [{ uid: "user-4", firstName: "Dave" }],
      },
      "opt-2": {
        [RankingTier.LoveIt]: [{ uid: "user-3", firstName: "Carol" }],
        [RankingTier.Yes]: [{ uid: "user-1", firstName: "Alice" }],
        [RankingTier.Maybe]: [{ uid: "user-2", firstName: "Bob" }],
        [RankingTier.NotForMe]: [],
        noRank: [],
      },
      "opt-3": {
        [RankingTier.LoveIt]: [],
        [RankingTier.Yes]: [{ uid: "user-4", firstName: "Dave" }],
        [RankingTier.Maybe]: [
          { uid: "user-2", firstName: "Bob" },
          { uid: "user-3", firstName: "Carol" },
        ],
        [RankingTier.NotForMe]: [{ uid: "user-1", firstName: "Alice" }],
        noRank: [],
      },
    },
  },
};
