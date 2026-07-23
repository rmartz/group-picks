export const SIGN_UP_COPY = {
  title: "Create an account",
  emailLabel: "Email",
  emailPlaceholder: "you@example.com",
  passwordLabel: "Password",
  submitButton: "Create account",
  signInPrompt: "Already have an account?",
  signInLink: "Sign in",
  errors: {
    "auth/email-already-in-use":
      "An account with this email already exists. Sign in instead.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/network-request-failed":
      "Network error. Check your connection and try again.",
    "auth/operation-not-allowed": "Email sign-up is currently unavailable.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/weak-password": "Password must be at least 6 characters.",
    default: "Something went wrong. Please try again.",
  },
} as const;
