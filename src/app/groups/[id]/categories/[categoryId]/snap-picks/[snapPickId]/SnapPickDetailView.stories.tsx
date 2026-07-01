import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  makeSnapPick,
  makeSnapPickActivation,
  makeSnapPickOption,
} from "@/lib/fixtures/snap-pick";

import { SnapPickDetailView } from "./SnapPickDetailView";

const meta = {
  title: "SnapPicks/SnapPickDetailView",
  component: SnapPickDetailView,
  args: {
    snapPick: makeSnapPick({ title: "Friday Lunch" }),
    groupId: "group-1",
    currentUserId: "user-1",
    options: [
      makeSnapPickOption({ id: "option-1", title: "Pizza", addedBy: "user-1" }),
      makeSnapPickOption({ id: "option-2", title: "Tacos", addedBy: "user-2" }),
    ],
  },
} satisfies Meta<typeof SnapPickDetailView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ActivationInProgress: Story = {
  args: {
    activation: makeSnapPickActivation({ closedAt: undefined }),
  },
};

export const ClosedWithWinner: Story = {
  args: {
    activation: makeSnapPickActivation({
      closedAt: new Date("2025-03-22T00:00:00.000Z"),
      winnerId: "option-2",
    }),
    winnerTitle: "Tacos",
  },
};
