import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReopenPickButtonView } from "./ReopenPickButtonView";
import { CATEGORY_DETAIL_COPY } from "./copy";

const meta: Meta<typeof ReopenPickButtonView> = {
  title: "Groups/Categories/ReopenPickButtonView",
  component: ReopenPickButtonView,
  args: {
    onReopen: () => undefined,
    isReopening: false,
    error: undefined,
  },
};

export default meta;

type Story = StoryObj<typeof ReopenPickButtonView>;

export const Default: Story = {};

export const Reopening: Story = {
  args: {
    isReopening: true,
  },
};

export const Error: Story = {
  args: {
    error: CATEGORY_DETAIL_COPY.errors.reopenFailed,
  },
};
