import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NewPickTypeSelectorView } from "./NewPickTypeSelectorView";

const noop = () => undefined;

const meta: Meta<typeof NewPickTypeSelectorView> = {
  title: "Picks/NewPickTypeSelectorView",
  component: NewPickTypeSelectorView,
  args: {
    pickType: "standard",
    onPickTypeChange: noop,
  },
};

export default meta;
type Story = StoryObj<typeof NewPickTypeSelectorView>;

export const StandardSelected: Story = {};

export const SnapSelected: Story = {
  args: {
    pickType: "snap",
  },
};
