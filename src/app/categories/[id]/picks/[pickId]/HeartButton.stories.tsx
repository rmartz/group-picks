import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HeartButton } from "./HeartButton";

const meta: Meta<typeof HeartButton> = {
  title: "Picks/HeartButton",
  component: HeartButton,
  args: {
    hearted: false,
    disabled: false,
    pickClosed: false,
    onClick: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof HeartButton>;

export const NotHearted: Story = {};

export const Hearted: Story = {
  args: {
    hearted: true,
  },
};

export const DisabledNotHearted: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledHearted: Story = {
  args: {
    hearted: true,
    disabled: true,
  },
};

export const ClosedNotHearted: Story = {
  args: {
    pickClosed: true,
  },
};

export const ClosedHearted: Story = {
  args: {
    hearted: true,
    pickClosed: true,
  },
};
