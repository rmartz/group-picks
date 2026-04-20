const providerLabels: Record<string, string> = {
  "apple.com": "Apple",
  "google.com": "Google",
  password: "Email & password",
};

export const USER_PROFILE_COPY = {
  title: "Profile",
  displayNameLabel: "Display name",
  displayNamePlaceholder: "Enter your display name",
  saveButton: "Save",
  linkedAccountsTitle: "Linked accounts",
  providers: providerLabels,
  successMessage: "Profile updated.",
  errors: {
    default: "Failed to update profile. Please try again.",
  },
} as const;
