import { cleanup, fireEvent,render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ErrorView } from "./ErrorView";
import { ERROR_VIEW_COPY } from "./ErrorView.copy";

afterEach(cleanup);

describe("renders error UI elements", () => {
  it("renders the headline", () => {
    render(<ErrorView onReset={() => undefined} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      ERROR_VIEW_COPY.headline,
    );
  });

  it("renders the body copy", () => {
    render(<ErrorView onReset={() => undefined} />);
    expect(screen.getByText(ERROR_VIEW_COPY.body)).toBeDefined();
  });

  it("renders the Try again button", () => {
    render(<ErrorView onReset={() => undefined} />);
    expect(
      screen.getByRole("button", { name: ERROR_VIEW_COPY.tryAgainButton }),
    ).toBeDefined();
  });

  it("renders the Go home link", () => {
    render(<ErrorView onReset={() => undefined} />);
    expect(
      screen.getByRole("link", { name: ERROR_VIEW_COPY.goHomeButton }),
    ).toBeDefined();
  });
});

describe("calls onReset when Try again is clicked", () => {
  it("calls onReset on Try again click", () => {
    const onReset = vi.fn();
    render(<ErrorView onReset={onReset} />);
    fireEvent.click(
      screen.getByRole("button", { name: ERROR_VIEW_COPY.tryAgainButton }),
    );
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
