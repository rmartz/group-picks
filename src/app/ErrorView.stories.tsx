import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ErrorView } from "./ErrorView";

const meta: Meta<typeof ErrorView> = {
  title: "App/ErrorView",
  component: ErrorView,
  args: {
    onReset: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof ErrorView>;

export const Default: Story = {};
