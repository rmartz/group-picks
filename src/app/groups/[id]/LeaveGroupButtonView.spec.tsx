import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GROUP_DETAIL_COPY } from "./copy";
import { LeaveGroupButtonView } from "./LeaveGroupButtonView";

afterEach(cleanup);

describe("LeaveGroupButtonView", () => {
  it("renders the leave button with the correct label", () => {
    render(
      <LeaveGroupButtonView
        onLeave={vi.fn()}
        isLeaving={false}
        error={undefined}
      />,
    );
    expect(screen.getByRole("button").textContent).toBe(
      GROUP_DETAIL_COPY.leaveButton,
    );
  });

  it("disables the button when leaving is in progress", () => {
    render(
      <LeaveGroupButtonView
        onLeave={vi.fn()}
        isLeaving={true}
        error={undefined}
      />,
    );
    expect(screen.getByRole("button").getAttribute("disabled")).not.toBeNull();
  });

  it("calls onLeave when the button is clicked", () => {
    const onLeave = vi.fn();
    render(
      <LeaveGroupButtonView
        onLeave={onLeave}
        isLeaving={false}
        error={undefined}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onLeave).toHaveBeenCalledOnce();
  });

  it("renders the error message when provided", () => {
    render(
      <LeaveGroupButtonView
        onLeave={vi.fn()}
        isLeaving={false}
        error={GROUP_DETAIL_COPY.errors.lastMember}
      />,
    );
    expect(screen.getByText(GROUP_DETAIL_COPY.errors.lastMember)).toBeDefined();
  });

  it("does not render an error message when error is undefined", () => {
    render(
      <LeaveGroupButtonView
        onLeave={vi.fn()}
        isLeaving={false}
        error={undefined}
      />,
    );
    expect(screen.queryByText(GROUP_DETAIL_COPY.errors.lastMember)).toBeNull();
    expect(screen.queryByText(GROUP_DETAIL_COPY.errors.default)).toBeNull();
  });
});
