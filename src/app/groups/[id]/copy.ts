export const GROUP_DETAIL_COPY = {
  closedBadge: "closed",
  closedSection: "Closed",
  copiedButton: "Copied!",
  copyButton: "Copy",
  errors: {
    default: "Failed to leave group. Please try again.",
    lastMember: "You are the only member — groups cannot be left empty.",
  },
  expiresAtLabel: "Expires",
  generateButton: "Generate Invite Link",
  inviteErrors: {
    default: "Something went wrong. Please try again.",
  },
  inviteLabel: "Invite Link",
  leaveButton: "Leave Group",
  membersHeading: "Members",
  membersLabel: "members",
  noPicksMessage: "No picks yet. Start one from the Categories tab.",
  notFound: "Group not found.",
  openBadge: "open",
  openSection: "Open",
  regenerateButton: "Revoke & Regenerate",
  regeneratingButton: "Regenerating…",
  tabs: {
    categories: "Categories",
    members: "Members",
    picks: "Picks",
  },
} as const;

export const CATEGORY_LIST_COPY = {
  addButton: "Add Category",
  addCategoryLabel: "New category name",
  addCategoryPlaceholder: "e.g. Best Movie",
  addingButton: "Adding…",
  deleteButton: "Delete",
  deletingButton: "Deleting…",
  empty: "No categories yet.",
  errors: {
    create: "Failed to add category.",
    delete: "Failed to delete category.",
    hasPicks:
      "Cannot delete a category that has picks. Remove all picks first.",
  },
  title: "Categories",
} as const;
