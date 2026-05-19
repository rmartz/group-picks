import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { GROUP_DETAIL_COPY } from "./copy";
import { GroupSettingsPanelView } from "./GroupSettingsPanelView";

const noop = () => undefined;

const meta: Meta<typeof GroupSettingsPanelView> = {
  title: "Groups/GroupSettingsPanelView",
  component: GroupSettingsPanelView,
  args: {
    picksRestricted: false,
    onTogglePicksRestricted: noop,
    isSaving: false,
    error: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof GroupSettingsPanelView>;

export const Unrestricted: Story = {};

export const Restricted: Story = {
  args: {
    picksRestricted: true,
  },
};

export const Saving: Story = {
  args: {
    isSaving: true,
  },
};

export const Error: Story = {
  args: {
    error: GROUP_DETAIL_COPY.settings.error,
  },
};
