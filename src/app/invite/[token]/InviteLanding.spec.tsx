import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { JOIN_GROUP_COPY } from "@/app/groups/join/copy";
import { deleteSession, signOut } from "@/services/auth";
import { joinGroup } from "@/services/groups";

import { INVITE_LANDING_COPY } from "./copy";
import { InviteLanding } from "./InviteLanding";

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
  vi.mocked(joinGroup).mockReset();
});

function renderLanding(signInHref = "/sign-in?next=/invite/abc123") {
  return render(
    <InviteLanding
      token="abc123"
      groupName="Book Club"
      groupEmoji="📚"
      memberCount={3}
      memberNames={["Alice", "Bob", "Carol"]}
      signInHref={signInHref}
    />,
  );
}

describe("handleJoin", () => {
  it("navigates to the group page after a successful join", async () => {
    vi.mocked(joinGroup).mockResolvedValue("group-42");
    renderLanding();
    fireEvent.click(
      screen.getByRole("button", { name: INVITE_LANDING_COPY.joinButton }),
    );
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/groups/group-42");
    });
  });

  it("shows an error and does not navigate when join fails", async () => {
    vi.mocked(joinGroup).mockRejectedValue(new Error("join error"));
    renderLanding();
    fireEvent.click(
      screen.getByRole("button", { name: INVITE_LANDING_COPY.joinButton }),
    );
    await waitFor(() => {
      expect(screen.getByText(JOIN_GROUP_COPY.errors.default)).toBeDefined();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe("handleSignInDifferentAccount", () => {
  beforeEach(() => {
    vi.mocked(deleteSession).mockResolvedValue(undefined);
    vi.mocked(signOut).mockResolvedValue(undefined);
  });

  it("calls deleteSession and signOut when sign-in button is clicked", async () => {
    renderLanding();
    fireEvent.click(
      screen.getByRole("button", {
        name: INVITE_LANDING_COPY.signInDifferentAccount,
      }),
    );
    await waitFor(() => {
      expect(deleteSession).toHaveBeenCalledOnce();
      expect(signOut).toHaveBeenCalledOnce();
    });
  });

  it("navigates to signInHref after successful sign-out", async () => {
    const signInHref = "/sign-in?next=/invite/abc123";
    renderLanding(signInHref);
    fireEvent.click(
      screen.getByRole("button", {
        name: INVITE_LANDING_COPY.signInDifferentAccount,
      }),
    );
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(signInHref);
    });
  });

  it("shows an error and does not navigate when deleteSession rejects", async () => {
    vi.mocked(deleteSession).mockRejectedValue(new Error("session error"));
    renderLanding();
    fireEvent.click(
      screen.getByRole("button", {
        name: INVITE_LANDING_COPY.signInDifferentAccount,
      }),
    );
    await waitFor(() => {
      expect(screen.getByText(JOIN_GROUP_COPY.errors.default)).toBeDefined();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows an error and does not navigate when signOut rejects", async () => {
    vi.mocked(signOut).mockRejectedValue(new Error("sign-out error"));
    renderLanding();
    fireEvent.click(
      screen.getByRole("button", {
        name: INVITE_LANDING_COPY.signInDifferentAccount,
      }),
    );
    await waitFor(() => {
      expect(screen.getByText(JOIN_GROUP_COPY.errors.default)).toBeDefined();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
