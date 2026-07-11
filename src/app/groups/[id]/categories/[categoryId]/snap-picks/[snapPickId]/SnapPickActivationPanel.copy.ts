export const SNAP_PICK_ACTIVATION_COPY = {
  startButton: "Start a pick",
  durationLabel: "How long is voting open?",
  durationOptions: {
    "same-day": "Until midnight today",
    "1-hour": "1 hour",
    "2-hours": "2 hours",
    "4-hours": "4 hours",
    custom: "Custom…",
  },
  customLabel: "Custom length (minutes)",
  inProgressHeading: "Voting is open",
  closesAtPrefix: "Closes",
  winnerHeading: "Winner",
  noVotesMessage: "No votes cast — no winner this round.",
  errorDefault: "Something went wrong. Please try again.",
} as const;
