import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { INVITE_LANDING_COPY } from "./copy";
import { InviteLandingView } from "./InviteLandingView";

afterEach(cleanup);

function makeDefaultProps() {
  return {
    groupName: "Book Club",
    groupEmoji: "📚",
    memberCount: 3,
    memberNames: [] as string[],
  };
}

describe("group preview", () => {
  it("renders the group name", () => {
    render(<InviteLandingView {...makeDefaultProps()} signInHref="/sign-in" />);
    expect(screen.getByText("Book Club")).toBeDefined();
  });

  it("renders plural member count", () => {
    render(
      <InviteLandingView
        {...makeDefaultProps()}
        memberCount={3}
        signInHref="/sign-in"
      />,
    );
    expect(
      screen.getByText(`3 ${INVITE_LANDING_COPY.memberPlural}`),
    ).toBeDefined();
  });

  it("renders singular member count", () => {
    render(
      <InviteLandingView
        {...makeDefaultProps()}
        memberCount={1}
        signInHref="/sign-in"
      />,
    );
    expect(
      screen.getByText(`1 ${INVITE_LANDING_COPY.memberSingular}`),
    ).toBeDefined();
  });
});

describe("who's in section", () => {
  it("renders member names when provided", () => {
    render(
      <InviteLandingView
        {...makeDefaultProps()}
        memberNames={["Alex", "Jamie"]}
        signInHref="/sign-in"
      />,
    );
    expect(screen.getByText(INVITE_LANDING_COPY.whoIsInHeading)).toBeDefined();
    expect(screen.getByText(/Alex/)).toBeDefined();
    expect(screen.getByText(/Jamie/)).toBeDefined();
  });

  it("does not render who's in section when member names are empty", () => {
    render(
      <InviteLandingView
        {...makeDefaultProps()}
        memberNames={[]}
        signInHref="/sign-in"
      />,
    );
    expect(screen.queryByText(INVITE_LANDING_COPY.whoIsInHeading)).toBeNull();
  });
});

describe("currently picking section", () => {
  it("renders the pick title when a current pick is provided", () => {
    render(
      <InviteLandingView
        {...makeDefaultProps()}
        currentPick={{ title: "Summer Read" }}
        signInHref="/sign-in"
      />,
    );
    expect(
      screen.getByText(INVITE_LANDING_COPY.currentlyPickingHeading),
    ).toBeDefined();
    expect(screen.getByText("Summer Read")).toBeDefined();
  });

  it("does not render the pick section when no current pick", () => {
    render(<InviteLandingView {...makeDefaultProps()} signInHref="/sign-in" />);
    expect(
      screen.queryByText(INVITE_LANDING_COPY.currentlyPickingHeading),
    ).toBeNull();
  });
});

describe("unauthenticated CTA", () => {
  it("renders a join link pointing to signInHref", () => {
    render(
      <InviteLandingView
        {...makeDefaultProps()}
        signInHref="/sign-in?invite_token=abc"
      />,
    );
    const link = screen.getByRole("link", {
      name: INVITE_LANDING_COPY.joinButton,
    });
    expect((link as HTMLAnchorElement).href).toContain(
      "/sign-in?invite_token=abc",
    );
  });

  it("renders the 'already a member' sign-in link", () => {
    render(
      <InviteLandingView
        {...makeDefaultProps()}
        signInHref="/sign-in?invite_token=abc"
      />,
    );
    expect(
      screen.getByRole("link", {
        name: INVITE_LANDING_COPY.alreadyMemberSignIn,
      }),
    ).toBeDefined();
  });
});

describe("authenticated CTA", () => {
  it("renders a join button that calls onJoin when clicked", () => {
    const onJoin = vi.fn();
    render(<InviteLandingView {...makeDefaultProps()} onJoin={onJoin} />);
    fireEvent.click(
      screen.getByRole("button", { name: INVITE_LANDING_COPY.joinButton }),
    );
    expect(onJoin).toHaveBeenCalledOnce();
  });

  it("does not render the already-a-member link when onJoin is provided", () => {
    const onJoin = vi.fn();
    render(<InviteLandingView {...makeDefaultProps()} onJoin={onJoin} />);
    expect(
      screen.queryByRole("link", {
        name: INVITE_LANDING_COPY.alreadyMemberSignIn,
      }),
    ).toBeNull();
  });
});
