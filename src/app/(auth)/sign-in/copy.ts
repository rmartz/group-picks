export const SIGN_IN_COPY = {
  title: "Sign in",
  emailLabel: "Email",
  emailPlaceholder: "you@example.com",
  passwordLabel: "Password",
  submitButton: "Sign in",
  appleButton: "Continue with Apple",
  googleButton: "Continue with Google",
  orDivider: "or",
  forgotPasswordLink: "Forgot password?",
  signUpPrompt: "Don't have an account?",
  signUpLink: "Sign up",
  errors: {
    "auth/account-exists-with-different-credential":
      "You already have an account using a different sign-in method.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/network-request-failed":
      "Network error. Check your connection and try again.",
    "auth/popup-blocked":
      "Your browser blocked the sign-in popup. Allow popups and try again.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "Invalid email or password.",
    "auth/wrong-password": "Invalid email or password.",
    default: "Something went wrong. Please try again.",
  },
} as const;
