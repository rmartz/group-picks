import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SUGGEST_OPTION_SHEET_COPY } from "./SuggestOptionSheet.copy";
import { SuggestOptionSheetView } from "./SuggestOptionSheetView";

const noop = () => undefined;

const meta: Meta<typeof SuggestOptionSheetView> = {
  title: "Picks/SuggestOptionSheetView",
  component: SuggestOptionSheetView,
  args: {
    title: "",
    onTitleChange: noop,
    onSubmit: noop,
    onCancel: noop,
    loading: false,
    error: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof SuggestOptionSheetView>;

export const Default: Story = {};

export const WithTitle: Story = {
  args: {
    title: "Inception",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    title: "Inception",
  },
};

export const WithError: Story = {
  args: {
    error: SUGGEST_OPTION_SHEET_COPY.errors.default,
  },
};
