import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within, expect } from "storybook/test";
import { UserProfileView } from "./UserProfileView";
import { USER_PROFILE_COPY } from "./copy";

const meta: Meta<typeof UserProfileView> = {
  title: "Profile/UserProfileView",
  component: UserProfileView,
  args: {
    initialDisplayName: "Alice Example",
    providerIds: ["google.com"],
    onSave: () => new Promise((res) => setTimeout(res, 1000)),
  },
};

export default meta;
type Story = StoryObj<typeof UserProfileView>;

export const Default: Story = {};

export const MultipleProviders: Story = {
  args: {
    providerIds: ["google.com", "apple.com", "password"],
  },
};

export const UnknownProvider: Story = {
  args: {
    providerIds: ["github.com"],
  },
};

export const EmptyDisplayName: Story = {
  args: {
    initialDisplayName: "",
  },
};

const neverResolves = (): Promise<void> => new Promise(Object);

export const Saving: Story = {
  args: {
    onSave: neverResolves,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: USER_PROFILE_COPY.saveButton }),
    );
    await expect(
      canvas.getByRole("button", { name: USER_PROFILE_COPY.saveButton }),
    ).toBeDisabled();
  },
};

export const SaveSuccess: Story = {
  args: {
    onSave: () => Promise.resolve(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: USER_PROFILE_COPY.saveButton }),
    );
    await canvas.findByText(USER_PROFILE_COPY.successMessage);
  },
};

export const SaveError: Story = {
  args: {
    onSave: () => Promise.reject(new Error("update failed")),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: USER_PROFILE_COPY.saveButton }),
    );
    await canvas.findByText(USER_PROFILE_COPY.errors.default);
  },
};
