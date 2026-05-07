import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { PickOption } from "@/lib/types/option";
import { OptionListView } from "./OptionListView";
import { OPTION_LIST_COPY } from "./copy";

const mockOptions: PickOption[] = [
  {
    id: "opt-1",
    name: "Pizza",
    creatorId: "user-1",
    owners: ["user-1", "user-2"],
    createdAt: new Date("2025-01-01"),
    pickId: "pick-1",
    categoryId: "cat-1",
    interestedCount: 2,
  },
  {
    id: "opt-2",
    name: "Sushi",
    creatorId: "user-3",
    owners: ["user-3"],
    createdAt: new Date("2025-01-02"),
    pickId: "pick-1",
    categoryId: "cat-1",
    interestedCount: 0,
  },
];

const meta: Meta<typeof OptionListView> = {
  title: "Picks/OptionListView",
  component: OptionListView,
  args: {
    options: [],
    newOptionName: "",
    loading: false,
    error: undefined,
    interestedOptionIds: [],
    onNewOptionNameChange: () => undefined,
    onSuggest: () => undefined,
    onToggleInterest: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof OptionListView>;

export const Empty: Story = {};

export const WithOptions: Story = {
  args: {
    options: mockOptions,
  },
};

export const Loading: Story = {
  args: {
    options: mockOptions,
    newOptionName: "Tacos",
    loading: true,
  },
};

export const WithError: Story = {
  args: {
    options: mockOptions,
    newOptionName: "Tacos",
    error: OPTION_LIST_COPY.errors.default,
  },
};

export const WithInterests: Story = {
  args: {
    options: mockOptions,
    interestedOptionIds: ["opt-1"],
  },
};

export const PickClosed: Story = {
  args: {
    options: mockOptions,
    interestedOptionIds: ["opt-1"],
    pickClosed: true,
  },
};
