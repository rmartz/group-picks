export const DELETE_GROUP_COPY = {
  cancelButton: "Cancel",
  confirmDeleteButton: "Delete group",
  confirmPlaceholder: "Enter group name",
  confirmPrompt: (groupName: string) =>
    `Type "${groupName}" to confirm deletion:`,
  deleteButton: "Delete Group",
  deletingButton: "Deleting…",
} as const;
