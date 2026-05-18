import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { Option } from "@/lib/types/option";

import { TopPicksView } from "./TopPicksView";

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

const meta: Meta<typeof TopPicksView> = {
  title: "Picks/TopPicksView",
  component: TopPicksView,
  args: {
    isOpen: false,
    topPicks: mockOptions,
    topCount: 3,
  },
};

export default meta;
type Story = StoryObj<typeof TopPicksView>;

export const Locked: Story = {
  args: {
    isOpen: true,
    topPicks: [],
  },
};

export const EmptyResults: Story = {
  args: {
    isOpen: false,
    topPicks: [],
  },
};

export const RevealedList: Story = {};
