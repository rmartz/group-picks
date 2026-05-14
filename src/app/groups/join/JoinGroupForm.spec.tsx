import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { JoinGroupForm } from "./JoinGroupForm";
import { JOIN_GROUP_COPY } from "./copy";
import { deleteSession, signOut } from "@/services/auth";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/services/auth", () => ({
  deleteSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/services/groups", () => ({
  joinGroup: vi.fn(),
}));

afterEach(() => {
  cleanup();
  mockPush.mockReset();
  vi.mocked(deleteSession).mockReset();
  vi.mocked(signOut).mockReset();
});

function renderForm(signInHref = "/sign-in?invite_token=abc123") {
  return render(
    <JoinGroupForm
      token="abc123"
      groupName="Book Club"
      signInHref={signInHref}
    />,
  );
}

describe("handleSignInDifferentAccount", () => {
  beforeEach(() => {
    vi.mocked(deleteSession).mockResolvedValue(undefined);
    vi.mocked(signOut).mockResolvedValue(undefined);
  });

  it("calls deleteSession and signOut when sign-in button is clicked", async () => {
    renderForm();
    fireEvent.click(
      screen.getByRole("button", {
        name: JOIN_GROUP_COPY.signInDifferentAccount,
      }),
    );
    await waitFor(() => {
      expect(deleteSession).toHaveBeenCalledOnce();
      expect(signOut).toHaveBeenCalledOnce();
    });
  });

  it("navigates to signInHref after successful sign-out", async () => {
    const signInHref = "/sign-in?invite_token=mytoken";
    renderForm(signInHref);
    fireEvent.click(
      screen.getByRole("button", {
        name: JOIN_GROUP_COPY.signInDifferentAccount,
      }),
    );
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(signInHref);
    });
  });

  it("shows an error and does not navigate when deleteSession rejects", async () => {
    vi.mocked(deleteSession).mockRejectedValue(new Error("session error"));
    renderForm();
    fireEvent.click(
      screen.getByRole("button", {
        name: JOIN_GROUP_COPY.signInDifferentAccount,
      }),
    );
    await waitFor(() => {
      expect(screen.getByText(JOIN_GROUP_COPY.errors.default)).toBeDefined();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows an error and does not navigate when signOut rejects", async () => {
    vi.mocked(signOut).mockRejectedValue(new Error("sign-out error"));
    renderForm();
    fireEvent.click(
      screen.getByRole("button", {
        name: JOIN_GROUP_COPY.signInDifferentAccount,
      }),
    );
    await waitFor(() => {
      expect(screen.getByText(JOIN_GROUP_COPY.errors.default)).toBeDefined();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
