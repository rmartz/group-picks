export const OPTION_LIST_COPY = {
  suggestPlaceholder: "Option name",
  suggestButton: "Suggest",
  ownerCount: {
    one: "1 member",
    other: (n: number) => `${String(n)} members`,
  },
  errors: {
    default: "Something went wrong. Please try again.",
  },
} as const;
