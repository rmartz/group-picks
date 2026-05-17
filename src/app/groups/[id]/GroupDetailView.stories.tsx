import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { Category } from "@/lib/types/category";
import type { Group } from "@/lib/types/group";
import type { GroupPick } from "@/lib/types/pick";

import { GroupDetailView } from "./GroupDetailView";

const noop = () => undefined;

const mockGroup: Group = {
  id: "group-1",
  name: "Friday Night Picks",
  createdAt: new Date("2025-01-15T12:00:00.000Z"),
  creatorId: "user-123",
  memberIds: ["user-123", "user-456", "user-789"],
  adminIds: ["user-123"],
  picksRestricted: false,
  inviteToken: "invite-token-1",
};

const mockMemberNames = [
  { uid: "user-123", name: "Alice" },
  { uid: "user-456", name: "Bob" },
  { uid: "user-789", name: "carol@example.com" },
];

const mockCategories: Category[] = [
  {
    id: "cat-1",
    groupId: "group-1",
    name: "Movies",
    description: "",
    createdAt: new Date("2025-01-15T12:00:00.000Z"),
    creatorId: "user-123",
  },
  {
    id: "cat-2",
    groupId: "group-1",
    name: "Books",
    description: "",
    createdAt: new Date("2025-01-16T12:00:00.000Z"),
    creatorId: "user-123",
  },
];

const mockPicks: GroupPick[] = [
  {
    id: "pick-1",
    title: "Friday flick",
    categoryId: "cat-1",
    topCount: 3,
    dueDate: new Date("2025-06-07"),
    createdAt: new Date("2025-01-15T12:00:00.000Z"),
    creatorId: "user-123",
  },
  {
    id: "pick-2",
    title: "Beach week read",
    categoryId: "cat-2",
    topCount: 1,
    createdAt: new Date("2025-01-16T12:00:00.000Z"),
    creatorId: "user-123",
  },
  {
    id: "pick-3",
    title: "Date night film",
    categoryId: "cat-1",
    topCount: 1,
    closedAt: new Date("2025-03-24"),
    createdAt: new Date("2025-01-10T12:00:00.000Z"),
    creatorId: "user-456",
  },
];

const meta: Meta<typeof GroupDetailView> = {
  title: "Groups/GroupDetailView",
  component: GroupDetailView,
  args: {
    group: mockGroup,
    categories: [],
    currentUserId: "user-123",
    onLeave: noop,
    memberNames: mockMemberNames,
    picksByCategory: {},
  },
};

export default meta;
type Story = StoryObj<typeof GroupDetailView>;

export const Default: Story = {};

const pick1 = mockPicks[0];
const pick2 = mockPicks[1];
const pick3 = mockPicks[2];

export const WithPicks: Story = {
  args: {
    categories: mockCategories,
    picksByCategory: {
      ...(pick1 && pick3 ? { "cat-1": [pick1, pick3] } : {}),
      ...(pick2 ? { "cat-2": [pick2] } : {}),
    },
  },
};

export const EmptyGroup: Story = {
  args: {
    group: { ...mockGroup, memberIds: [] },
    memberNames: [],
  },
};
