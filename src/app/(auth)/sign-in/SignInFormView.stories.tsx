import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SignInFormView } from "./SignInFormView";
import { SIGN_IN_COPY } from "./copy";

const meta: Meta<typeof SignInFormView> = {
  title: "Auth/SignInFormView",
  component: SignInFormView,
  args: {
    email: "",
    onEmailChange: () => undefined,
    password: "",
    onPasswordChange: () => undefined,
    onSubmit: () => undefined,
    onGoogleSignIn: () => undefined,
    onAppleSignIn: () => undefined,
    appleEnabled: false,
    loading: false,
    error: undefined,
    signUpHref: "/sign-up",
  },
};

export default meta;
type Story = StoryObj<typeof SignInFormView>;

export const Default: Story = {};

export const WithApple: Story = {
  args: {
    appleEnabled: true,
  },
};

export const WithError: Story = {
  args: {
    error: SIGN_IN_COPY.errors.default,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    email: "user@example.com",
  },
};

export const WithInviteToken: Story = {
  args: {
    signUpHref: "/sign-up?invite_token=abc123",
  },
};
