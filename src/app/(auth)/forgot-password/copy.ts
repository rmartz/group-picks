export const FORGOT_PASSWORD_COPY = {
  title: "Reset your password",
  description: "Enter your email and we'll send you a reset link.",
  emailLabel: "Email",
  emailPlaceholder: "you@example.com",
  submitButton: "Send reset link",
  successMessage:
    "If an account exists for that email, we've sent a password reset link.",
  signInLink: "Back to sign in",
  errors: {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/missing-email": "Please enter your email address.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    default: "Something went wrong. Please try again.",
  },
} as const;
