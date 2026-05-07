import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HeartButton } from "./HeartButton";

const meta: Meta<typeof HeartButton> = {
  title: "Picks/HeartButton",
  component: HeartButton,
  args: {
    interested: false,
    disabled: false,
    onClick: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof HeartButton>;

export const NotInterested: Story = {};

export const Interested: Story = {
  args: {
    interested: true,
  },
};

export const DisabledNotInterested: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledInterested: Story = {
  args: {
    interested: true,
    disabled: true,
  },
};
