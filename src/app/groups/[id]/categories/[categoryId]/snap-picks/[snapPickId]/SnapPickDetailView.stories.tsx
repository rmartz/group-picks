import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { makeSnapPick } from "@/lib/fixtures/snap-pick";

import { SnapPickDetailView } from "./SnapPickDetailView";

const meta = {
  title: "SnapPicks/SnapPickDetailView",
  component: SnapPickDetailView,
  args: {
    snapPick: makeSnapPick({ title: "Friday Lunch" }),
  },
} satisfies Meta<typeof SnapPickDetailView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
