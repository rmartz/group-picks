import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import SignUpForm from "./SignUpForm";
import { SIGN_UP_COPY } from "./copy";
import { signUp, createSession } from "@/services/auth";
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
  signUp: vi.fn(),
  createSession: vi.fn(),
}));

afterEach(() => {
  cleanup();
  mockPush.mockReset();
  mockInviteToken = null;
});

describe("SignUpForm", () => {
  it("renders the page title", () => {
    render(<SignUpForm />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      SIGN_UP_COPY.title,
    );
  });

  it("renders email and password fields", () => {
    render(<SignUpForm />);
    expect(screen.getByLabelText(SIGN_UP_COPY.emailLabel)).toBeDefined();
    expect(screen.getByLabelText(SIGN_UP_COPY.passwordLabel)).toBeDefined();
  });

  it("renders the submit button", () => {
    render(<SignUpForm />);
    expect(
      screen.getByRole("button", { name: SIGN_UP_COPY.submitButton }),
    ).toBeDefined();
  });

  it("renders the sign in link", () => {
    render(<SignUpForm />);
    expect(screen.getByText(SIGN_UP_COPY.signInLink)).toBeDefined();
  });

  it("redirects to / after sign-up when no invite_token param is present", async () => {
    vi.mocked(signUp).mockResolvedValue({
      user: { getIdToken: () => Promise.resolve("token") },
    } as unknown as UserCredential);
    vi.mocked(createSession).mockResolvedValue(undefined);

    render(<SignUpForm />);
    fireEvent.change(screen.getByLabelText(SIGN_UP_COPY.emailLabel), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(SIGN_UP_COPY.passwordLabel), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: SIGN_UP_COPY.submitButton }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("redirects to /invite/${token} after sign-up when a valid invite_token param is present", async () => {
    mockInviteToken = "abc123";
    vi.mocked(signUp).mockResolvedValue({
      user: { getIdToken: () => Promise.resolve("token") },
    } as unknown as UserCredential);
    vi.mocked(createSession).mockResolvedValue(undefined);

    render(<SignUpForm />);
    fireEvent.change(screen.getByLabelText(SIGN_UP_COPY.emailLabel), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(SIGN_UP_COPY.passwordLabel), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: SIGN_UP_COPY.submitButton }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/invite/abc123");
    });
  });

  it("does not redirect to /invite when invite_token contains invalid characters", async () => {
    mockInviteToken = "../../evil";
    vi.mocked(signUp).mockResolvedValue({
      user: { getIdToken: () => Promise.resolve("token") },
    } as unknown as UserCredential);
    vi.mocked(createSession).mockResolvedValue(undefined);

    render(<SignUpForm />);
    fireEvent.change(screen.getByLabelText(SIGN_UP_COPY.emailLabel), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(SIGN_UP_COPY.passwordLabel), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: SIGN_UP_COPY.submitButton }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("links to /sign-in with invite_token when a valid invite_token param is present", () => {
    mockInviteToken = "abc123";

    render(<SignUpForm />);
    const signInLink = screen.getByText(SIGN_UP_COPY.signInLink).closest("a");
    expect(signInLink?.getAttribute("href")).toBe("/sign-in?invite_token=abc123");
  });

  it("links to /sign-in without invite_token when no invite_token param is present", () => {
    render(<SignUpForm />);
    const signInLink = screen.getByText(SIGN_UP_COPY.signInLink).closest("a");
    expect(signInLink?.getAttribute("href")).toBe("/sign-in");
  });
});
