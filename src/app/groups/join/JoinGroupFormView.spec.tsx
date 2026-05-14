import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { JOIN_GROUP_COPY } from "./copy";
import { JoinGroupFormView } from "./JoinGroupFormView";

afterEach(cleanup);

describe("JoinGroupFormView", () => {
  it("renders the group name in the join prompt", () => {
    render(
      <JoinGroupFormView
        groupName="Book Club"
        onJoin={() => undefined}
        loading={false}
        error={undefined}
      />,
    );

    expect(screen.getByText("Book Club")).toBeDefined();
    expect(
      screen.getByText(JOIN_GROUP_COPY.joinPrompt, { exact: false }),
    ).toBeDefined();
  });

  it("renders the join button when not loading", () => {
    render(
      <JoinGroupFormView
        groupName="Book Club"
        onJoin={() => undefined}
        loading={false}
        error={undefined}
      />,
    );

    const button = screen.getByRole("button");
    expect(button.textContent).toBe(JOIN_GROUP_COPY.joinButton);
  });

  it("renders loading text when loading", () => {
    render(
      <JoinGroupFormView
        groupName="Book Club"
        onJoin={() => undefined}
        loading={true}
        error={undefined}
      />,
    );

    expect(screen.getByText(JOIN_GROUP_COPY.joiningButton)).toBeDefined();
  });

  it("disables the button when loading", () => {
    render(
      <JoinGroupFormView
        groupName="Book Club"
        onJoin={() => undefined}
        loading={true}
        error={undefined}
      />,
    );

    const button = screen.getByRole("button");
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it("renders an error message when provided", () => {
    render(
      <JoinGroupFormView
        groupName="Book Club"
        onJoin={() => undefined}
        loading={false}
        error={JOIN_GROUP_COPY.errors.default}
      />,
    );

    expect(screen.getByText(JOIN_GROUP_COPY.errors.default)).toBeDefined();
  });

  it("calls onJoin when the button is clicked", () => {
    let called = false;

    render(
      <JoinGroupFormView
        groupName="Book Club"
        onJoin={() => {
          called = true;
        }}
        loading={false}
        error={undefined}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(called).toBe(true);
  });
});
