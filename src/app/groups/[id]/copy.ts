export const GROUP_DETAIL_COPY = {
  categoriesLabel: "Categories",
  copied: "Copied!",
  copiedButton: "Copied!",
  copyButton: "Copy",
  copyLink: "Copy",
  createdAtLabel: "Created",
  errors: {
    default: "Failed to leave group. Please try again.",
    lastMember: "You are the only member — groups cannot be left empty.",
  },
  generateButton: "Generate Invite Link",
  inviteErrors: {
    default: "Something went wrong. Please try again.",
  },
  inviteLabel: "Invite Link",
  inviteLinkLabel: "Invite Link",
  leaveButton: "Leave Group",
  membersLabel: "Members",
  notFound: "Group not found.",
  regenerateButton: "Revoke & Regenerate",
  regeneratingButton: "Regenerating…",
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
