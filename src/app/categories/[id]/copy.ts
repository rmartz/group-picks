export const CATEGORY_DETAIL_COPY = {
  picksLabel: "Picks",
  noPicksMessage: "No picks have been added to this category yet.",
  editButton: "Edit",
  editForm: {
    title: "Edit Pick",
    nameLabel: "Pick Name",
    namePlaceholder: "e.g. The Shawshank Redemption",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Add context for this pick",
    topCountLabel: "Top N Count",
    dueDateLabel: "Due Date",
    submitButton: "Save Changes",
    cancelButton: "Cancel",
  },
  metadata: {
    topCountLabel: "Top",
    dueDateLabel: "Due",
    noDueDateLabel: "No due date",
  },
  errors: {
    default: "Something went wrong. Please try again.",
  },
} as const;
