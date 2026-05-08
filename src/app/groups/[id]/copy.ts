export const GROUP_DETAIL_COPY = {
  categoriesLabel: "Categories",
  createdAtLabel: "Created",
  membersLabel: "Members",
  notFound: "Group not found.",
  createCategoryButton: "Create Category",
  leaveButton: "Leave Group",
  errors: {
    lastMember: "You are the only member — groups cannot be left empty.",
    default: "Failed to leave group. Please try again.",
  },
} as const;

export const CATEGORY_LIST_COPY = {
  title: "Categories",
  empty: "No categories yet.",
  deleteButton: "Delete",
  deletingButton: "Deleting…",
  addCategoryLabel: "New category name",
  addCategoryPlaceholder: "e.g. Best Movie",
  addButton: "Add Category",
  addingButton: "Adding…",
  errors: {
    delete: "Failed to delete category.",
    hasPicks:
      "Cannot delete a category that has picks. Remove all picks first.",
    create: "Failed to add category.",
  },
} as const;
