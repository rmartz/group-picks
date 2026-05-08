import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { InviteView } from "./InviteView";
import { INVITE_COPY } from "./copy";

const meta: Meta<typeof InviteView> = {
  title: "Invite/InviteView",
  component: InviteView,
  args: {
    groupId: "group-abc",
    groupName: "Movie Night Crew",
    token: "tok-mock-123",
    isMember: false,
  },
};

export default meta;
type Story = StoryObj<typeof InviteView>;

export const Default: Story = {};

export const AlreadyMember: Story = {
  args: {
    isMember: true,
  },
};

export const Loading: Story = {
  decorators: [
    (Story) => {
      globalThis.fetch = () => new Promise(() => undefined);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText(INVITE_COPY.joinButton));
  },
};

export const WithError: Story = {
  decorators: [
    (Story) => {
      globalThis.fetch = () =>
        Promise.resolve(new Response(null, { status: 500 }));
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText(INVITE_COPY.joinButton));
  },
};
