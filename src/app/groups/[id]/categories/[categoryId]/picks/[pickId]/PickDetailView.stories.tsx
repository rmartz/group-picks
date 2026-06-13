import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { Option } from "@/lib/types/option";
import type { GroupPick } from "@/lib/types/pick";
import { RankingMode } from "@/lib/types/pick";
import { RankingTier } from "@/lib/types/ranking";

import { PickDetailView } from "./PickDetailView";

const mockPick: GroupPick = {
  id: "pick-1",
  title: "Best Movie of 2025",
  topCount: 3,
  categoryId: "cat-1",
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  creatorId: "user-1",
  rankingMode: RankingMode.TierBuckets,
};

const mockClosedPick: GroupPick = {
  ...mockPick,
  closedAt: new Date("2025-06-01T00:00:00.000Z"),
};

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

const meta: Meta<typeof PickDetailView> = {
  title: "Picks/PickDetailView",
  component: PickDetailView,
  parameters: {
    nextjs: { appDirectory: true },
  },
  args: {
    pick: mockPick,
    groupId: "group-1",
    categoryId: "cat-1",
    currentUserId: "user-1",
    initialOptions: mockOptions,
    initialSuggestions: [],
    topPicks: [],
  },
};

export default meta;
type Story = StoryObj<typeof PickDetailView>;

export const OpenPick: Story = {};

export const ClosedPickNonCreator: Story = {
  args: {
    pick: mockClosedPick,
    currentUserId: "user-2",
  },
};

export const ClosedPickCreator: Story = {
  args: {
    pick: mockClosedPick,
    currentUserId: "user-1",
  },
};

export const TopOne: Story = {
  args: {
    pick: { ...mockPick, topCount: 1 },
  },
};

export const EmptyOptions: Story = {
  args: {
    initialOptions: [],
  },
};

export const WithSuggestions: Story = {
  args: {
    initialSuggestions: [
      {
        id: "sug-1",
        title: "The Matrix",
        pickId: "pick-0",
        ownerIds: ["user-1"],
      },
      {
        id: "sug-2",
        title: "Parasite",
        pickId: "pick-0",
        ownerIds: ["user-1"],
      },
    ],
  },
};

export const WithPriorPickBanner: Story = {
  args: {
    categoryName: "Movies",
    priorPickBannerData: {
      pickTitle: "Best of 2024",
      rankedAt: new Date("2024-06-01T00:00:00.000Z"),
      overlappingCount: 2,
      prefillAssignments: {
        "opt-1": RankingTier.LoveIt,
        "opt-3": RankingTier.Yes,
      },
    },
  },
};
