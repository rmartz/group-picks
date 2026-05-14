import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SignOutButton } from "./SignOutButton";
import { SIGN_OUT_BUTTON_COPY } from "./SignOutButton.copy";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/services/auth", () => ({
  deleteSession: vi.fn(),
  signOut: vi.fn(),
}));

afterEach(cleanup);

describe("SignOutButton", () => {
  it("renders a button with the correct label", () => {
    render(<SignOutButton />);
    const button = screen.getByRole("button");
    expect(button.textContent).toBe(SIGN_OUT_BUTTON_COPY.button);
  });
});
