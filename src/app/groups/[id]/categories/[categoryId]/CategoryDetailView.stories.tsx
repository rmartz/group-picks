import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { Category } from "@/lib/types/category";
import type { GroupPick } from "@/lib/types/pick";

import { CategoryDetailView } from "./CategoryDetailView";

const category: Category = {
  id: "cat-1",
  name: "Best Movies",
  description: "Rank your favorite movie picks",
  groupId: "group-1",
  createdAt: new Date("2025-01-15T12:00:00.000Z"),
  creatorId: "user-1",
};

const picks: GroupPick[] = [
  {
    id: "pick-open",
    title: "The Shawshank Redemption",
    description: "A classic film about hope",
    topCount: 3,
    categoryId: "cat-1",
    closedAt: undefined,
    createdAt: new Date("2025-01-20T12:00:00.000Z"),
    creatorId: "user-1",
  },
  {
    id: "pick-closed",
    title: "Inception",
    description: "A mind-bending sci-fi thriller",
    topCount: 3,
    categoryId: "cat-1",
    closedAt: new Date("2025-01-21T12:00:00.000Z"),
    closedManually: true,
    createdAt: new Date("2025-01-20T12:00:00.000Z"),
    creatorId: "user-1",
  },
];

const meta: Meta<typeof CategoryDetailView> = {
  title: "Groups/Categories/CategoryDetailView",
  component: CategoryDetailView,
  parameters: {
    nextjs: { appDirectory: true },
  },
  args: {
    category,
    picks,
  },
};

export default meta;

type Story = StoryObj<typeof CategoryDetailView>;

export const Default: Story = {};

export const CanCloseOpenPick: Story = {
  args: {
    closePickAction: () => Promise.resolve(),
  },
};

export const NoPicks: Story = {
  args: {
    picks: [],
  },
};
