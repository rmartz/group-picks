import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SIGN_IN_COPY } from "./copy";
import { SignInFormView } from "./SignInFormView";

afterEach(cleanup);

function renderView(overrides?: Partial<Parameters<typeof SignInFormView>[0]>) {
  const defaults = {
    email: "",
    onEmailChange: vi.fn(),
    password: "",
    onPasswordChange: vi.fn(),
    onSubmit: vi.fn(),
    onGoogleSignIn: vi.fn(),
    onAppleSignIn: vi.fn(),
    appleEnabled: false,
    loading: false,
    error: undefined,
    signUpHref: "/sign-up",
  };
  return render(<SignInFormView {...defaults} {...overrides} />);
}

describe("page structure", () => {
  it("renders the page title", () => {
    renderView();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      SIGN_IN_COPY.title,
    );
  });

  it("renders the OR divider", () => {
    renderView();
    expect(screen.getByText(SIGN_IN_COPY.orDivider)).toBeDefined();
  });
});

describe("SSO buttons", () => {
  it("renders the Google sign-in button", () => {
    renderView();
    expect(screen.getByText(SIGN_IN_COPY.googleButton)).toBeDefined();
  });

  it("renders the Apple sign-in button when appleEnabled is true", () => {
    renderView({ appleEnabled: true });
    expect(screen.getByText(SIGN_IN_COPY.appleButton)).toBeDefined();
  });

  it("hides the Apple sign-in button when appleEnabled is false", () => {
    renderView({ appleEnabled: false });
    expect(screen.queryByText(SIGN_IN_COPY.appleButton)).toBeNull();
  });

  it("calls onGoogleSignIn when the Google button is clicked", () => {
    const onGoogleSignIn = vi.fn();
    renderView({ onGoogleSignIn });
    fireEvent.click(screen.getByText(SIGN_IN_COPY.googleButton));
    expect(onGoogleSignIn).toHaveBeenCalledOnce();
  });

  it("calls onAppleSignIn when the Apple button is clicked", () => {
    const onAppleSignIn = vi.fn();
    renderView({ appleEnabled: true, onAppleSignIn });
    fireEvent.click(screen.getByText(SIGN_IN_COPY.appleButton));
    expect(onAppleSignIn).toHaveBeenCalledOnce();
  });
});

describe("email/password fields", () => {
  it("renders the email input", () => {
    renderView();
    expect(screen.getByLabelText(SIGN_IN_COPY.emailLabel)).toBeDefined();
  });

  it("renders the password input", () => {
    renderView();
    expect(screen.getByLabelText(SIGN_IN_COPY.passwordLabel)).toBeDefined();
  });

  it("reflects the email prop in the email input", () => {
    renderView({ email: "test@example.com" });
    const input = screen.getByLabelText<HTMLInputElement>(
      SIGN_IN_COPY.emailLabel,
    );
    expect(input.value).toBe("test@example.com");
  });

  it("reflects the password prop in the password input", () => {
    renderView({ password: "secret123" });
    const input = screen.getByLabelText<HTMLInputElement>(
      SIGN_IN_COPY.passwordLabel,
    );
    expect(input.value).toBe("secret123");
  });

  it("calls onEmailChange when the email input changes", () => {
    const onEmailChange = vi.fn();
    renderView({ onEmailChange });
    fireEvent.change(screen.getByLabelText(SIGN_IN_COPY.emailLabel), {
      target: { value: "new@example.com" },
    });
    expect(onEmailChange).toHaveBeenCalled();
  });

  it("calls onPasswordChange when the password input changes", () => {
    const onPasswordChange = vi.fn();
    renderView({ onPasswordChange });
    fireEvent.change(screen.getByLabelText(SIGN_IN_COPY.passwordLabel), {
      target: { value: "newpassword" },
    });
    expect(onPasswordChange).toHaveBeenCalled();
  });
});

describe("form submission", () => {
  it("renders the submit button", () => {
    renderView();
    expect(
      screen.getByRole("button", { name: SIGN_IN_COPY.submitButton }),
    ).toBeDefined();
  });

  it("calls onSubmit when the form is submitted", () => {
    const onSubmit = vi.fn();
    renderView({ onSubmit });
    const form = screen
      .getByRole("button", { name: SIGN_IN_COPY.submitButton })
      .closest("form");
    fireEvent.submit(form!);
    expect(onSubmit).toHaveBeenCalled();
  });
});

describe("footer links", () => {
  it("renders the forgot password link", () => {
    renderView();
    expect(screen.getByText(SIGN_IN_COPY.forgotPasswordLink)).toBeDefined();
  });

  it("renders the sign-up link", () => {
    renderView();
    expect(screen.getByText(SIGN_IN_COPY.signUpLink)).toBeDefined();
  });

  it("uses signUpHref for the sign-up link href", () => {
    renderView({ signUpHref: "/sign-up?invite_token=abc" });
    const link = screen.getByText(SIGN_IN_COPY.signUpLink).closest("a");
    expect(link?.getAttribute("href")).toBe("/sign-up?invite_token=abc");
  });
});

describe("error display", () => {
  it("shows the error message when error is provided", () => {
    renderView({ error: SIGN_IN_COPY.errors.default });
    expect(screen.getByText(SIGN_IN_COPY.errors.default)).toBeDefined();
  });

  it("does not show an error message when error is undefined", () => {
    renderView({ error: undefined });
    expect(screen.queryByText(SIGN_IN_COPY.errors.default)).toBeNull();
  });
});

describe("loading state", () => {
  it("disables the Google button when loading", () => {
    renderView({ loading: true });
    const button = screen.getByRole<HTMLButtonElement>("button", {
      name: SIGN_IN_COPY.googleButton,
    });
    expect(button.disabled).toBe(true);
  });

  it("disables the submit button when loading", () => {
    renderView({ loading: true });
    const button = screen.getByRole<HTMLButtonElement>("button", {
      name: SIGN_IN_COPY.submitButton,
    });
    expect(button.disabled).toBe(true);
  });

  it("disables the email input when loading", () => {
    renderView({ loading: true });
    const input = screen.getByLabelText<HTMLInputElement>(
      SIGN_IN_COPY.emailLabel,
    );
    expect(input.disabled).toBe(true);
  });

  it("disables the password input when loading", () => {
    renderView({ loading: true });
    const input = screen.getByLabelText<HTMLInputElement>(
      SIGN_IN_COPY.passwordLabel,
    );
    expect(input.disabled).toBe(true);
  });
});
