import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { ClosedPickResultEntry } from "@/lib/ranking-score";
import type { Option } from "@/lib/types/option";

import { ClosedPickResultsView } from "./ClosedPickResultsView";

function makeOption(id: string, title: string): Option {
  return { id, title, pickId: "pick-1", ownerIds: [] };
}

function makeEntry(
  id: string,
  title: string,
  rank: number,
  score: number,
): ClosedPickResultEntry {
  return { option: makeOption(id, title), rank, score };
}

const meta: Meta<typeof ClosedPickResultsView> = {
  title: "Picks/ClosedPickResultsView",
  component: ClosedPickResultsView,
  args: {
    topCount: 3,
    topPicks: [
      makeEntry("opt-1", "The Shawshank Redemption", 1, 8),
      makeEntry("opt-2", "Inception", 2, 6),
      makeEntry("opt-3", "Interstellar", 3, 4),
    ],
    runnersUp: [
      makeEntry("opt-4", "The Dark Knight", 4, 3),
      makeEntry("opt-5", "Parasite", 5, 2),
    ],
  },
};

export default meta;
type Story = StoryObj<typeof ClosedPickResultsView>;

export const Default: Story = {};

export const WithReopen: Story = {
  args: {
    onReopen: () => undefined,
  },
};

export const WithTie: Story = {
  args: {
    topPicks: [
      makeEntry("opt-1", "The Shawshank Redemption", 1, 8),
      makeEntry("opt-2", "Inception", 2, 5),
      makeEntry("opt-3", "Interstellar", 2, 5),
    ],
    runnersUp: [makeEntry("opt-4", "The Dark Knight", 4, 3)],
  },
};

export const TieAtBoundary: Story = {
  args: {
    topPicks: [
      makeEntry("opt-1", "The Shawshank Redemption", 1, 8),
      makeEntry("opt-2", "Inception", 2, 5),
      makeEntry("opt-3", "Interstellar", 2, 5),
      makeEntry("opt-4", "The Dark Knight", 2, 5),
    ],
    runnersUp: [],
  },
};

export const WinnerTie: Story = {
  args: {
    topPicks: [
      makeEntry("opt-1", "The Shawshank Redemption", 1, 8),
      makeEntry("opt-2", "Inception", 1, 8),
    ],
    runnersUp: [makeEntry("opt-3", "Interstellar", 3, 4)],
  },
};

export const Empty: Story = {
  args: {
    topPicks: [],
    runnersUp: [],
  },
};
