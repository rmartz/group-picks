import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { JOIN_GROUP_COPY } from "@/app/groups/join/copy";

import { InviteLandingView } from "./InviteLandingView";

const meta: Meta<typeof InviteLandingView> = {
  title: "Invite/InviteLandingView",
  component: InviteLandingView,
  args: {
    groupName: "Book Club",
    memberCount: 5,
    memberNames: ["Alice", "Bob", "Carol"],
    currentPick: undefined,
    signInHref: "/sign-in?invite_token=abc123",
    onJoin: undefined,
    isJoining: false,
    onSignInDifferentAccount: undefined,
    error: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof InviteLandingView>;

export const Unauthenticated: Story = {};

export const UnauthenticatedWithCurrentPick: Story = {
  args: {
    currentPick: { title: "Best Sci-Fi Novel of 2024" },
  },
};

export const UnauthenticatedWithManyMembers: Story = {
  args: {
    memberCount: 12,
    memberNames: ["Alice", "Bob", "Carol", "David", "Eve"],
  },
};

export const UnauthenticatedSingleMember: Story = {
  args: {
    memberCount: 1,
    memberNames: ["Alice"],
  },
};

export const UnauthenticatedNoMembers: Story = {
  args: {
    memberCount: 0,
    memberNames: [],
  },
};

export const Authenticated: Story = {
  args: {
    signInHref: undefined,
    onJoin: () => undefined,
    onSignInDifferentAccount: () => undefined,
  },
};

export const AuthenticatedWithCurrentPick: Story = {
  args: {
    signInHref: undefined,
    onJoin: () => undefined,
    onSignInDifferentAccount: () => undefined,
    currentPick: { title: "Best Sci-Fi Novel of 2024" },
  },
};

export const AuthenticatedJoining: Story = {
  args: {
    signInHref: undefined,
    onJoin: () => undefined,
    isJoining: true,
    onSignInDifferentAccount: () => undefined,
  },
};

export const AuthenticatedWithError: Story = {
  args: {
    signInHref: undefined,
    onJoin: () => undefined,
    onSignInDifferentAccount: () => undefined,
    error: JOIN_GROUP_COPY.errors.default,
  },
};
