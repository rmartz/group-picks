export const SNAP_PICK_HISTORY_COPY = {
  emptyState: "No picks yet — start one!",
  topPicksLabel: "Top picks:",
  noWinnerTitle: "No winner",
  participantCount: (count: number) =>
    `${count.toString()} ${count === 1 ? "voter" : "voters"}`,
  winCount: (title: string, wins: number) => `${title} ×${wins.toString()}`,
} as const;
