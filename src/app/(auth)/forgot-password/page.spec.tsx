import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { sendPasswordReset } from "@/services/auth";

import { FORGOT_PASSWORD_COPY } from "./copy";
import ForgotPasswordPage from "./page";

vi.mock("@/services/auth", () => ({
  sendPasswordReset: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.mocked(sendPasswordReset).mockReset();
});

function submitEmail(value: string) {
  fireEvent.change(screen.getByLabelText(FORGOT_PASSWORD_COPY.emailLabel), {
    target: { value },
  });
  fireEvent.click(
    screen.getByRole("button", { name: FORGOT_PASSWORD_COPY.submitButton }),
  );
}

describe("ForgotPasswordPage enumeration safety", () => {
  it("shows the neutral success message when the account does not exist", async () => {
    vi.mocked(sendPasswordReset).mockRejectedValue({
      code: "auth/user-not-found",
    });

    render(<ForgotPasswordPage />);
    submitEmail("missing@example.com");

    await waitFor(() => {
      expect(
        screen.getByText(FORGOT_PASSWORD_COPY.successMessage),
      ).toBeDefined();
    });
  });
});

describe("ForgotPasswordPage error mapping", () => {
  it("shows the specific message for a mapped error code", async () => {
    vi.mocked(sendPasswordReset).mockRejectedValue({
      code: "auth/too-many-requests",
    });

    render(<ForgotPasswordPage />);
    submitEmail("user@example.com");

    await waitFor(() => {
      expect(
        screen.getByText(FORGOT_PASSWORD_COPY.errors["auth/too-many-requests"]),
      ).toBeDefined();
    });
  });
});
