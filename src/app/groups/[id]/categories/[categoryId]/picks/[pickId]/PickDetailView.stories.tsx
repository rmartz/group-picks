import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { GroupPick } from "@/lib/types/pick";
import type { Option } from "@/lib/types/option";
import { PickDetailView } from "./PickDetailView";

const mockPick: GroupPick = {
  id: "pick-1",
  title: "Best Movie of 2025",
  topCount: 3,
  categoryId: "cat-1",
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  creatorId: "user-1",
};

const mockOptions: Option[] = [
  {
    id: "opt-1",
    title: "The Shawshank Redemption",
    pickId: "pick-1",
    ownerIds: ["user-1"],
  },
  { id: "opt-2", title: "Inception", pickId: "pick-1", ownerIds: ["user-2"] },
  {
    id: "opt-3",
    title: "Interstellar",
    pickId: "pick-1",
    ownerIds: ["user-1"],
  },
];

const meta: Meta<typeof PickDetailView> = {
  title: "Picks/PickDetailView",
  component: PickDetailView,
  args: {
    pick: mockPick,
    groupId: "group-1",
    categoryId: "cat-1",
    currentUserId: "user-1",
    initialOptions: mockOptions,
    initialSuggestions: [],
  },
};

export default meta;
type Story = StoryObj<typeof PickDetailView>;

export const OpenPick: Story = {};

export const ClosedPick: Story = {
  args: {
    pick: {
      ...mockPick,
      closedAt: new Date("2025-06-01T00:00:00.000Z"),
    },
  },
};

export const TopOne: Story = {
  args: {
    pick: { ...mockPick, topCount: 1 },
  },
};

export const EmptyOptions: Story = {
  args: {
    initialOptions: [],
  },
};

export const WithSuggestions: Story = {
  args: {
    initialSuggestions: [
      {
        id: "sug-1",
        title: "The Matrix",
        pickId: "pick-0",
        ownerIds: ["user-1"],
      },
      {
        id: "sug-2",
        title: "Parasite",
        pickId: "pick-0",
        ownerIds: ["user-1"],
      },
    ],
  },
};
