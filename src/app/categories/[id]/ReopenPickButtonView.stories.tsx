import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CATEGORY_DETAIL_COPY } from "./copy";
import { ReopenPickButtonView } from "./ReopenPickButtonView";

const noop = () => undefined;

const meta: Meta<typeof ReopenPickButtonView> = {
  title: "Categories/ReopenPickButtonView",
  component: ReopenPickButtonView,
  args: {
    onReopen: noop,
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
