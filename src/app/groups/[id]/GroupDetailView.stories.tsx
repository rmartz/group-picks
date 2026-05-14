import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Group } from "@/lib/types/group";
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

const meta: Meta<typeof GroupDetailView> = {
  title: "Groups/GroupDetailView",
  component: GroupDetailView,
  args: {
    group: mockGroup,
    categories: [],
    currentUserId: "user-123",
    onLeave: noop,
    memberNames: mockMemberNames,
  },
};

export default meta;
type Story = StoryObj<typeof GroupDetailView>;

export const Default: Story = {};

export const EmptyGroup: Story = {
  args: {
    group: { ...mockGroup, memberIds: [] },
    memberNames: [],
  },
};
