import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { makeSnapPickHistoryEntry } from "@/lib/fixtures/snap-pick";

import { SnapPickHistoryView } from "./SnapPickHistoryView";

const meta = {
  title: "SnapPicks/SnapPickHistoryView",
  component: SnapPickHistoryView,
} satisfies Meta<typeof SnapPickHistoryView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    entries: [],
  },
};

export const SingleEntry: Story = {
  args: {
    entries: [
      makeSnapPickHistoryEntry({
        activationId: "act-1",
        winnerTitle: "Pizza",
        participantCount: 3,
        closedAt: new Date("2025-03-20T00:00:00.000Z"),
      }),
    ],
  },
};

export const MultipleEntries: Story = {
  args: {
    entries: [
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
  },
};

export const NoWinnerEntry: Story = {
  args: {
    entries: [
      makeSnapPickHistoryEntry({
        activationId: "act-tie",
        winnerTitle: undefined,
        participantCount: 2,
        closedAt: new Date("2025-03-20T00:00:00.000Z"),
      }),
    ],
  },
};
