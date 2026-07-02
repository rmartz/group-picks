import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Breadcrumbs } from "./Breadcrumbs";

const meta: Meta<typeof Breadcrumbs> = {
  title: "Components/Breadcrumbs",
  component: Breadcrumbs,
  parameters: {
    nextjs: { appDirectory: true },
  },
};

export default meta;

type Story = StoryObj<typeof Breadcrumbs>;

export const SingleCrumb: Story = {
  args: {
    crumbs: [{ label: "Best Movies", href: "/groups/group-1" }],
  },
};

export const TwoCrumbs: Story = {
  args: {
    crumbs: [
      { label: "Movie Night", href: "/groups/group-1" },
      { label: "Best Movies", href: "/groups/group-1/categories/cat-1" },
    ],
  },
};

export const ThreeCrumbs: Story = {
  args: {
    crumbs: [
      { label: "Movie Night", href: "/groups/group-1" },
      { label: "Best Movies", href: "/groups/group-1/categories/cat-1" },
      {
        label: "Top 3 of 2025",
        href: "/groups/group-1/categories/cat-1/picks/pick-1",
      },
    ],
  },
};
