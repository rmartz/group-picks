export const CREATE_SNAP_PICK_COPY = {
  title: "Create a Snap Pick",
  subtitle:
    "Snap Picks start with just a name. You add options and run votes from the Snap Pick page.",
  nameLabel: "Snap Pick name",
  namePlaceholder: "e.g. What's for dinner?",
  submitButton: "Create Snap Pick",
  submittingButton: "Creating…",
  cancelButton: "Cancel",
  errors: {
    nameRequired: "Snap Pick name cannot be blank.",
    default: "Could not create the Snap Pick. Please try again.",
  },
} as const;
