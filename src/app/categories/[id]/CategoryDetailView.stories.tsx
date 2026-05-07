import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CategoryDetailView } from "./CategoryDetailView";

const meta = {
  title: "App/Categories/CategoryDetailView",
  component: CategoryDetailView,
} satisfies Meta<typeof CategoryDetailView>;

export default meta;

type Story = StoryObj<typeof meta>;

const baseCategory = {
  id: "cat-1",
  name: "Best Movies",
  description: "Pick your favourite movie of the year",
  groupId: "group-1",
  createdAt: new Date("2025-01-15T12:00:00.000Z"),
  creatorId: "user-123",
};

const picks = [
  {
    id: "pick-1",
    title: "Movie One",
    categoryId: "cat-1",
    createdAt: new Date("2025-01-20T12:00:00.000Z"),
    creatorId: "user-123",
  },
  {
    id: "pick-2",
    title: "Movie Two",
    categoryId: "cat-1",
    createdAt: new Date("2025-01-20T12:01:00.000Z"),
    creatorId: "user-123",
  },
  {
    id: "pick-3",
    title: "Movie Three",
    categoryId: "cat-1",
    createdAt: new Date("2025-01-20T12:02:00.000Z"),
    creatorId: "user-123",
  },
];

export const Default: Story = {
  args: {
    category: baseCategory,
    picks,
  },
};

export const TopPicksLocked: Story = {
  args: {
    category: {
      ...baseCategory,
      topPickCount: 3,
      rankedCount: 2,
      totalCount: 5,
    },
    picks,
  },
};

export const TopPicksRevealed: Story = {
  args: {
    category: {
      ...baseCategory,
      topPickCount: 2,
      rankedBallots: [
        ["pick-1", "pick-2", "pick-3"],
        ["pick-1", "pick-3", "pick-2"],
        ["pick-2", "pick-1", "pick-3"],
      ],
      closedAt: new Date("2025-01-21T00:00:00.000Z"),
    },
    picks,
  },
};
