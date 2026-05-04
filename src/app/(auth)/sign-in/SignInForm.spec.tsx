import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import SignInForm from "./SignInForm";
import { SIGN_IN_COPY } from "./copy";
import { signIn, signInWithApple, createSession } from "@/services/auth";
import type { UserCredential } from "firebase/auth";

const mockPush = vi.fn();
let mockInviteToken: string | null = null;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (key: string) => (key === "invite_token" ? mockInviteToken : null),
  }),
}));

vi.mock("@/services/auth", () => ({
  signIn: vi.fn(),
  createSession: vi.fn(),
  signInWithGoogle: vi.fn(),
  signInWithApple: vi.fn(),
}));

afterEach(() => {
  cleanup();
  mockPush.mockReset();
  mockInviteToken = null;
});

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

  it("hides the Apple sign-in button when NEXT_PUBLIC_APPLE_SSO_ENABLED is not set", () => {
    render(<SignInForm />);
    expect(screen.queryByText(SIGN_IN_COPY.appleButton)).toBeNull();
  });

  it("renders the Apple sign-in button when NEXT_PUBLIC_APPLE_SSO_ENABLED is true", () => {
    vi.stubEnv("NEXT_PUBLIC_APPLE_SSO_ENABLED", "true");
    render(<SignInForm />);
    expect(screen.getByText(SIGN_IN_COPY.appleButton)).toBeDefined();
    vi.unstubAllEnvs();
  });

  it("calls signInWithApple when Apple button is clicked", () => {
    vi.stubEnv("NEXT_PUBLIC_APPLE_SSO_ENABLED", "true");
    vi.mocked(signInWithApple).mockResolvedValue(undefined);
    render(<SignInForm />);
    fireEvent.click(screen.getByText(SIGN_IN_COPY.appleButton));
    expect(vi.mocked(signInWithApple)).toHaveBeenCalledOnce();
    vi.unstubAllEnvs();
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

  it("redirects to /invite/${token} after sign-in when a valid invite_token param is present", async () => {
    mockInviteToken = "abc123";
    vi.mocked(signIn).mockResolvedValue({
      user: { getIdToken: () => Promise.resolve("token") },
    } as unknown as UserCredential);
    vi.mocked(createSession).mockResolvedValue(undefined);

    render(<SignInForm />);
    fireEvent.change(screen.getByLabelText(SIGN_IN_COPY.emailLabel), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(SIGN_IN_COPY.passwordLabel), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: SIGN_IN_COPY.submitButton }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/invite/abc123");
    });
  });

  it("does not redirect to /invite when invite_token contains invalid characters", async () => {
    mockInviteToken = "../../evil";
    vi.mocked(signIn).mockResolvedValue({
      user: { getIdToken: () => Promise.resolve("token") },
    } as unknown as UserCredential);
    vi.mocked(createSession).mockResolvedValue(undefined);

    render(<SignInForm />);
    fireEvent.change(screen.getByLabelText(SIGN_IN_COPY.emailLabel), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(SIGN_IN_COPY.passwordLabel), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: SIGN_IN_COPY.submitButton }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("links to /sign-up with invite_token when a valid invite_token param is present", () => {
    mockInviteToken = "abc123";

    render(<SignInForm />);
    const signUpLink = screen.getByText(SIGN_IN_COPY.signUpLink).closest("a");
    expect(signUpLink?.getAttribute("href")).toBe("/sign-up?invite_token=abc123");
  });

  it("links to /sign-up without invite_token when no invite_token param is present", () => {
    render(<SignInForm />);
    const signUpLink = screen.getByText(SIGN_IN_COPY.signUpLink).closest("a");
    expect(signUpLink?.getAttribute("href")).toBe("/sign-up");
  });
});
