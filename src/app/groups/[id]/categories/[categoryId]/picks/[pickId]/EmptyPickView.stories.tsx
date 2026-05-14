import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyPickView } from "./EmptyPickView";

const meta: Meta<typeof EmptyPickView> = {
  title: "Picks/EmptyPickView",
  component: EmptyPickView,
  args: {
    onSuggestOption: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof EmptyPickView>;

export const Default: Story = {};
