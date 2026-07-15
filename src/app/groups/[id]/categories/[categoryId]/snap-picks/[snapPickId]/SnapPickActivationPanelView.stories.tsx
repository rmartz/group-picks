import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SnapPickActivationPanelView } from "./SnapPickActivationPanelView";

const meta = {
  title: "SnapPicks/SnapPickActivationPanelView",
  component: SnapPickActivationPanelView,
  args: {
    activeClosesAt: undefined,
    lastWinnerTitle: undefined,
    hasClosedRun: false,
    selection: "same-day",
    customMinutes: "",
    loading: false,
    error: undefined,
    onSelectionChange: () => undefined,
    onCustomMinutesChange: () => undefined,
    onStart: () => undefined,
  },
} satisfies Meta<typeof SnapPickActivationPanelView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const CustomDuration: Story = {
  args: {
    selection: "custom",
    customMinutes: "90",
  },
};

export const InProgress: Story = {
  args: {
    activeClosesAt: new Date("2025-03-22T00:00:00.000Z"),
  },
};

export const ClosedWithWinner: Story = {
  args: {
    hasClosedRun: true,
    lastWinnerTitle: "Tacos",
  },
};

export const ClosedNoVotes: Story = {
  args: {
    hasClosedRun: true,
    lastWinnerTitle: undefined,
  },
};

export const WithError: Story = {
  args: {
    error: "Something went wrong. Please try again.",
  },
};
