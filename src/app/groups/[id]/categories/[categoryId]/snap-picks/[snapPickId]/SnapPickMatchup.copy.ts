export const SNAP_PICK_MATCHUP_COPY = {
  prompt: "Which do you prefer?",
  chooseLabel: "Choose",
  // Rendered as `${completed} of ${total} matchups completed`.
  progress: (completed: number, total: number) =>
    `${completed.toString()} of ${total.toString()} matchups completed`,
  completionHeading: "You're done! Waiting for others…",
  completionPoolHeading: "Options in this run",
  errorDefault: "Something went wrong. Please try again.",
  noMatchupsMessage: "There aren't enough options for a head-to-head vote yet.",
} as const;
