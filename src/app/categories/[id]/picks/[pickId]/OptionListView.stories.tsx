import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OptionListView } from "./OptionListView";
import type { Option } from "@/lib/types/option";

function makeOption(overrides?: Partial<Option>): Option {
  return {
    id: "opt-1",
    title: "The Shawshank Redemption",
    pickId: "pick-1",
    ownerIds: ["user-1"],
    ...overrides,
  };
}

const meta = {
  title: "Picks/OptionListView",
  component: OptionListView,
  args: {
    options: [],
    suggestions: [],
    newTitle: "",
    loading: false,
    error: undefined,
    currentUserId: "user-1",
    pickClosed: false,
    onNewTitleChange: () => undefined,
    onAddSubmit: () => undefined,
    onAdoptSuggestion: () => undefined,
    onToggleOwner: () => undefined,
  },
} satisfies Meta<typeof OptionListView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithOptions: Story = {
  args: {
    options: [
      makeOption({
        id: "opt-1",
        title: "The Shawshank Redemption",
        ownerIds: ["user-1", "user-2"],
      }),
      makeOption({
        id: "opt-2",
        title: "Inception",
        ownerIds: ["user-2"],
      }),
    ],
  },
};

export const WithSuggestions: Story = {
  args: {
    suggestions: [
      makeOption({ id: "sug-1", title: "The Matrix" }),
      makeOption({ id: "sug-2", title: "Interstellar" }),
    ],
  },
};

export const WithOptionsAndSuggestions: Story = {
  args: {
    options: [makeOption({ id: "opt-1", title: "The Shawshank Redemption" })],
    suggestions: [makeOption({ id: "sug-1", title: "The Matrix" })],
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    newTitle: "Interstellar",
  },
};

export const WithError: Story = {
  args: {
    error: "Something went wrong. Please try again.",
  },
};

export const ClosedPick: Story = {
  args: {
    pickClosed: true,
    options: [
      makeOption({
        id: "opt-1",
        title: "The Shawshank Redemption",
        ownerIds: ["user-1", "user-2"],
      }),
      makeOption({
        id: "opt-2",
        title: "Inception",
        ownerIds: ["user-2"],
      }),
    ],
    suggestions: [makeOption({ id: "sug-1", title: "The Matrix" })],
  },
};
