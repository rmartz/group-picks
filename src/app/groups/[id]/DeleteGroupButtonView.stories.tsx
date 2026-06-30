import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { GROUP_DETAIL_COPY } from "./copy";
import { DeleteGroupButtonView } from "./DeleteGroupButtonView";
import { DELETE_GROUP_COPY } from "./DeleteGroupButtonView.copy";

const GROUP_NAME = "Friday Night Picks";

interface DeletingStateStoryProps {
  groupName: string;
}

function DeletingStateStory({ groupName }: DeletingStateStoryProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <DeleteGroupButtonView
      groupName={groupName}
      onDelete={() => {
        setIsDeleting(true);
      }}
      isDeleting={isDeleting}
      error={undefined}
    />
  );
}

const meta: Meta<typeof DeleteGroupButtonView> = {
  title: "Groups/DeleteGroupButtonView",
  component: DeleteGroupButtonView,
  args: {
    error: undefined,
    groupName: GROUP_NAME,
    isDeleting: false,
    onDelete: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof DeleteGroupButtonView>;

export const Initial: Story = {};

export const ConfirmingEmpty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: DELETE_GROUP_COPY.deleteButton }),
    );
    await expect(canvas.getByTestId("delete-group-confirm")).toBeDefined();
  },
};

export const ConfirmingValid: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: DELETE_GROUP_COPY.deleteButton }),
    );
    const input = canvas.getByLabelText(
      DELETE_GROUP_COPY.confirmPrompt(GROUP_NAME),
    );
    await userEvent.type(input, GROUP_NAME);
    await expect(
      canvas.getByRole("button", {
        name: DELETE_GROUP_COPY.confirmDeleteButton,
      }),
    ).not.toBeDisabled();
  },
};

export const Deleting: Story = {
  render: ({ groupName }) => <DeletingStateStory groupName={groupName} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: DELETE_GROUP_COPY.deleteButton }),
    );
    const input = canvas.getByLabelText(
      DELETE_GROUP_COPY.confirmPrompt(GROUP_NAME),
    );
    await userEvent.type(input, GROUP_NAME);
    await userEvent.click(
      canvas.getByRole("button", {
        name: DELETE_GROUP_COPY.confirmDeleteButton,
      }),
    );
    await expect(
      canvas.getByRole("button", { name: DELETE_GROUP_COPY.deletingButton }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: DELETE_GROUP_COPY.cancelButton }),
    ).toBeDisabled();
  },
};

export const Error: Story = {
  args: {
    error: GROUP_DETAIL_COPY.deleteGroupError,
  },
};
