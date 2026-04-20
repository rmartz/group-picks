import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import SignInForm from "./SignInForm";
import { SIGN_IN_COPY } from "./copy";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
}));

vi.mock("@/services/auth", () => ({
  signIn: vi.fn(),
  createSession: vi.fn(),
  signInWithGoogle: vi.fn(),
}));

afterEach(cleanup);

describe("SignInForm", () => {
  it("renders the page title", () => {
    render(<SignInForm />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      SIGN_IN_COPY.title,
    );
  });

  it("renders email and password fields", () => {
    render(<SignInForm />);
    expect(screen.getByLabelText(SIGN_IN_COPY.emailLabel)).toBeDefined();
    expect(screen.getByLabelText(SIGN_IN_COPY.passwordLabel)).toBeDefined();
  });

  it("renders the Google sign-in button", () => {
    render(<SignInForm />);
    expect(screen.getByText(SIGN_IN_COPY.googleButton)).toBeDefined();
  });

  it("renders the submit button", () => {
    render(<SignInForm />);
    expect(
      screen.getByRole("button", { name: SIGN_IN_COPY.submitButton }),
    ).toBeDefined();
  });

  it("renders the or divider", () => {
    render(<SignInForm />);
    expect(screen.getByText(SIGN_IN_COPY.orDivider)).toBeDefined();
  });

  it("renders the forgot password link", () => {
    render(<SignInForm />);
    expect(screen.getByText(SIGN_IN_COPY.forgotPasswordLink)).toBeDefined();
  });

  it("renders the sign up link", () => {
    render(<SignInForm />);
    expect(screen.getByText(SIGN_IN_COPY.signUpLink)).toBeDefined();
  });
});
