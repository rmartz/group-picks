import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DEBUG_PROFILES } from "@/lib/debug/profiles";

import { DEBUG_SWITCHER_COPY } from "./DebugUserSwitcher.copy";
import { DebugUserSwitcherView } from "./DebugUserSwitcherView";

const meta = {
  title: "Debug/DebugUserSwitcherView",
  component: DebugUserSwitcherView,
  args: {
    profiles: DEBUG_PROFILES,
    onSelect: () => undefined,
    loadingId: undefined,
    error: undefined,
  },
} satisfies Meta<typeof DebugUserSwitcherView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SigningIn: Story = {
  args: { loadingId: "debug-alice" },
};

export const Error: Story = {
  args: { error: DEBUG_SWITCHER_COPY.error },
};
