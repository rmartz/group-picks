import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { makeSnapPickOption } from "@/lib/fixtures/snap-pick";

import { SnapPickMatchupView } from "./SnapPickMatchupView";

const pizza = makeSnapPickOption({ id: "opt-a", title: "Pizza" });
const tacos = makeSnapPickOption({ id: "opt-b", title: "Tacos" });
const sushi = makeSnapPickOption({ id: "opt-c", title: "Sushi" });

const meta = {
  title: "SnapPicks/SnapPickMatchupView",
  component: SnapPickMatchupView,
  args: {
    left: pizza,
    right: tacos,
    completed: 1,
    total: 3,
    pool: [pizza, tacos, sushi],
    loading: false,
    error: undefined,
    onChoose: () => undefined,
  },
} satisfies Meta<typeof SnapPickMatchupView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Complete: Story = {
  args: {
    left: undefined,
    right: undefined,
    completed: 3,
    total: 3,
  },
};

export const NoMatchups: Story = {
  args: {
    left: undefined,
    right: undefined,
    completed: 0,
    total: 0,
    pool: [pizza],
  },
};

export const WithError: Story = {
  args: {
    error: "Something went wrong. Please try again.",
  },
};
