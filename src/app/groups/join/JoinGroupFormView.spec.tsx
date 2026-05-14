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
    signInHref: "/sign-in?invite_token=abc123",
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
    expect(screen.getByRole("button").textContent).toBe(
      JOIN_GROUP_COPY.joiningButton,
    );
  });

  it("disables the button when loading", () => {
    renderView({ loading: true });
    const button = screen.getByRole<HTMLButtonElement>("button");
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
  it("renders the sign in to different account link", () => {
    renderView();
    expect(
      screen.getByText(JOIN_GROUP_COPY.signInDifferentAccount),
    ).toBeDefined();
  });

  it("uses signInHref for the link href", () => {
    renderView({ signInHref: "/sign-in?invite_token=xyz" });
    const link = screen
      .getByText(JOIN_GROUP_COPY.signInDifferentAccount)
      .closest("a");
    expect(link?.getAttribute("href")).toBe("/sign-in?invite_token=xyz");
  });
});
