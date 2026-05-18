export const PICK_DETAIL_COPY = {
  addOptionButton: "Add",
  addOptionPlaceholder: "Add an option...",
  adoptButton: "Use this",
  closedNotice: "This Pick is closed. Preferences can no longer be changed.",
  errors: {
    default: "Something went wrong. Please try again.",
  },
  heart: {
    addOwnership: "Add to your options",
    closed: "This Pick is closed",
    removeOwnership: "Remove from your options",
  },
  noOptionsMessage: "No options have been added yet.",
  optionsHeading: "Options",
  suggestionsHeading: "Suggestions from your prior picks",
} as const;

export const PICK_DETAIL_SCAFFOLD_COPY = {
  categoryLabel: "Category",
  closedStatusChip: "Closed",
  dueDateLabel: "Due:",
  openStatusChip: "Open",
  participantsLabel: "Participants",
  rankingTabPlaceholder: "Ranking coming soon.",
  resultsPlaceholder: "No options were added to this pick.",
  suggestOptionButton: "Suggest option",
  tabs: {
    options: "Options",
    ranking: "Your ranking",
    topPicks: "Top picks",
  },
  topCountLabel: "Top",
  topPicksLockedPlaceholder:
    "Top picks will be revealed when this pick closes.",
} as const;
