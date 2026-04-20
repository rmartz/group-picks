import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
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
