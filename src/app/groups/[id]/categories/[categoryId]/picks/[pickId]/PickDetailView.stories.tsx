import { vi } from "vitest";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { GroupPick } from "@/lib/types/pick";
import { PickDetailView } from "./PickDetailView";

vi.mock("@/app/categories/[id]/picks/[pickId]/OptionList", () => ({
  OptionList: () => <div data-testid="option-list" />,
}));

const mockOpenPick: GroupPick = {
  id: "pick-1",
  title: "Best Movie of 2025",
  topCount: 3,
  categoryId: "cat-1",
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  creatorId: "user-1",
};

const mockClosedPick: GroupPick = {
  ...mockOpenPick,
  closedAt: new Date("2025-06-01T00:00:00.000Z"),
};

const meta = {
  title: "Picks/PickDetailView",
  component: PickDetailView,
  args: {
    pick: mockOpenPick,
    groupId: "group-1",
    categoryId: "cat-1",
    currentUserId: "user-1",
    initialOptions: [],
    initialSuggestions: [],
  },
} satisfies Meta<typeof PickDetailView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenState: Story = {};

export const ClosedStateNonCreator: Story = {
  args: {
    pick: mockClosedPick,
    currentUserId: "user-2",
  },
};

export const ClosedStateCreator: Story = {
  args: {
    pick: mockClosedPick,
    currentUserId: "user-1",
  },
};
