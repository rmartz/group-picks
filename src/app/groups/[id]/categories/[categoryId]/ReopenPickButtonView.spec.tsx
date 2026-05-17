import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CATEGORY_DETAIL_COPY } from "./copy";
import { ReopenPickButtonView } from "./ReopenPickButtonView";

afterEach(cleanup);

describe("ReopenPickButtonView", () => {
  it("renders the reopen button with the correct label", () => {
    render(
      <ReopenPickButtonView
        onReopen={vi.fn()}
        isReopening={false}
        error={undefined}
      />,
    );

    expect(screen.getByRole("button").textContent).toBe(
      CATEGORY_DETAIL_COPY.reopenPickButton,
    );
  });

  it("disables the button while reopening is in progress", () => {
    render(
      <ReopenPickButtonView
        onReopen={vi.fn()}
        isReopening={true}
        error={undefined}
      />,
    );

    expect(screen.getByRole("button").getAttribute("disabled")).not.toBeNull();
  });

  it("enables the button when reopening is not in progress", () => {
    render(
      <ReopenPickButtonView
        onReopen={vi.fn()}
        isReopening={false}
        error={undefined}
      />,
    );

    expect(screen.getByRole("button").getAttribute("disabled")).toBeNull();
  });

  it("calls onReopen when the button is clicked", () => {
    const onReopen = vi.fn();
    render(
      <ReopenPickButtonView
        onReopen={onReopen}
        isReopening={false}
        error={undefined}
      />,
    );

    fireEvent.click(screen.getByRole("button"));

    expect(onReopen).toHaveBeenCalledOnce();
  });

  it("renders the error message when provided", () => {
    render(
      <ReopenPickButtonView
        onReopen={vi.fn()}
        isReopening={false}
        error={CATEGORY_DETAIL_COPY.errors.reopenFailed}
      />,
    );

    expect(
      screen.getByText(CATEGORY_DETAIL_COPY.errors.reopenFailed),
    ).toBeDefined();
  });

  it("does not render an error message when error is undefined", () => {
    render(
      <ReopenPickButtonView
        onReopen={vi.fn()}
        isReopening={false}
        error={undefined}
      />,
    );

    expect(
      screen.queryByText(CATEGORY_DETAIL_COPY.errors.reopenFailed),
    ).toBeNull();
  });
});
