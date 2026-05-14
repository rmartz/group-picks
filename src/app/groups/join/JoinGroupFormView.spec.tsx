import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { JOIN_GROUP_COPY } from "./copy";
import { JoinGroupFormView } from "./JoinGroupFormView";

afterEach(cleanup);

function renderView(
  overrides?: Partial<Parameters<typeof JoinGroupFormView>[0]>,
) {
  const defaults = {
    groupName: "Book Club",
    onJoin: vi.fn(),
    loading: false,
    error: undefined,
    onSignInDifferentAccount: vi.fn(),
  };
  return render(<JoinGroupFormView {...defaults} {...overrides} />);
}

describe("headline", () => {
  it("renders the page headline", () => {
    renderView();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      JOIN_GROUP_COPY.joinTitle,
    );
  });
});

describe("group preview", () => {
  it("renders the group name", () => {
    renderView({ groupName: "Hiking Friends" });
    expect(screen.getByText("Hiking Friends")).toBeDefined();
  });

  it("renders member count when provided", () => {
    renderView({ memberCount: 5 });
    expect(screen.getByText(/5 members/)).toBeDefined();
  });

  it("renders singular member count when count is 1", () => {
    renderView({ memberCount: 1 });
    expect(screen.getByText(/1 member/)).toBeDefined();
  });

  it("does not render member count when not provided", () => {
    renderView({ memberCount: undefined });
    expect(screen.queryByText(/members/)).toBeNull();
  });
});

describe("join button", () => {
  it("renders the join button", () => {
    renderView();
    expect(
      screen.getByRole("button", { name: JOIN_GROUP_COPY.joinButton }),
    ).toBeDefined();
  });

  it("shows loading text when loading", () => {
    renderView({ loading: true });
    expect(
      screen.getByRole("button", { name: JOIN_GROUP_COPY.joiningButton })
        .textContent,
    ).toBe(JOIN_GROUP_COPY.joiningButton);
  });

  it("disables the button when loading", () => {
    renderView({ loading: true });
    const button = screen.getByRole<HTMLButtonElement>("button", {
      name: JOIN_GROUP_COPY.joiningButton,
    });
    expect(button.disabled).toBe(true);
  });

  it("calls onJoin when the join button is clicked", () => {
    const onJoin = vi.fn();
    renderView({ onJoin });
    fireEvent.click(
      screen.getByRole("button", { name: JOIN_GROUP_COPY.joinButton }),
    );
    expect(onJoin).toHaveBeenCalledOnce();
  });
});

describe("error display", () => {
  it("renders an error message when provided", () => {
    renderView({ error: JOIN_GROUP_COPY.errors.default });
    expect(screen.getByText(JOIN_GROUP_COPY.errors.default)).toBeDefined();
  });

  it("does not render an error message when not provided", () => {
    renderView({ error: undefined });
    expect(screen.queryByText(JOIN_GROUP_COPY.errors.default)).toBeNull();
  });
});

describe("sign in link", () => {
  it("renders the sign in to different account button", () => {
    renderView();
    expect(
      screen.getByText(JOIN_GROUP_COPY.signInDifferentAccount),
    ).toBeDefined();
  });

  it("calls onSignInDifferentAccount when clicked", () => {
    const onSignInDifferentAccount = vi.fn();
    renderView({ onSignInDifferentAccount });
    fireEvent.click(screen.getByText(JOIN_GROUP_COPY.signInDifferentAccount));
    expect(onSignInDifferentAccount).toHaveBeenCalledOnce();
  });
});
