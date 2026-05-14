export const OPTION_LIST_COPY = {
  suggestFormLabel: "Suggest an option",
  suggestPlaceholder: "Option name",
  suggestButton: "+ Suggest",
  errors: {
    default: "Something went wrong. Please try again.",
  },
  heart: {
    markInterested: "Mark interested",
    removeInterest: "Remove interest",
  },
  interestCount: (count: number) => `${String(count)} interested`,
  headerCaption: "Tap a heart to mark interest",
} as const;
