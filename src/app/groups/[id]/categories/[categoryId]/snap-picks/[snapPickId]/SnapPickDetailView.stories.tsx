import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  makeSnapPick,
  makeSnapPickActivation,
  makeSnapPickHistoryEntry,
  makeSnapPickOption,
} from "@/lib/fixtures/snap-pick";

import { SnapPickDetailView } from "./SnapPickDetailView";

const meta = {
  title: "SnapPicks/SnapPickDetailView",
  component: SnapPickDetailView,
  parameters: {
    nextjs: { appDirectory: true },
  },
  args: {
    snapPick: makeSnapPick({ title: "Friday Lunch" }),
    groupId: "group-1",
    currentUserId: "user-1",
    votedPairKeys: [],
    historyEntries: [
      makeSnapPickHistoryEntry({
        activationId: "act-3",
        winnerTitle: "Pizza",
        participantCount: 5,
        closedAt: new Date("2025-03-20T00:00:00.000Z"),
      }),
      makeSnapPickHistoryEntry({
        activationId: "act-2",
        winnerTitle: "Tacos",
        participantCount: 4,
        closedAt: new Date("2025-03-13T00:00:00.000Z"),
      }),
      makeSnapPickHistoryEntry({
        activationId: "act-1",
        winnerTitle: "Pizza",
        participantCount: 3,
        closedAt: new Date("2025-03-06T00:00:00.000Z"),
      }),
    ],
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
