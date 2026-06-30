import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { makeSnapPick } from "@/lib/fixtures/snap-pick";

import { SnapPickSectionView } from "./SnapPickSectionView";

const meta = {
  title: "Categories/SnapPickSectionView",
  component: SnapPickSectionView,
  args: {
    groupId: "group-1",
    categoryId: "cat-1",
    title: "",
    onTitleChange: () => undefined,
    onSubmit: () => undefined,
    loading: false,
    error: undefined,
    snapPicks: [
      makeSnapPick({ id: "snap-a", title: "Lunch spot" }),
      makeSnapPick({ id: "snap-b", title: "Movie night" }),
    ],
  },
} satisfies Meta<typeof SnapPickSectionView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithSnapPicks: Story = {};

export const Empty: Story = {
  args: { snapPicks: [] },
};

export const Creating: Story = {
  args: { title: "Dinner", loading: true },
};

export const Error: Story = {
  args: { title: "Dinner", error: "Could not create the Snap Pick." },
};
