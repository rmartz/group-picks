import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EmptyPickView } from "./EmptyPickView";
import { EMPTY_PICK_COPY } from "./EmptyPickView.copy";

afterEach(cleanup);

describe("headline and body copy", () => {
  it("renders the headline", () => {
    render(<EmptyPickView onSuggestOption={() => undefined} />);
    expect(screen.getByRole("heading").textContent).toBe(
      EMPTY_PICK_COPY.headline,
    );
  });

  it("renders the body copy", () => {
    render(<EmptyPickView onSuggestOption={() => undefined} />);
    expect(screen.getByText(EMPTY_PICK_COPY.body)).toBeDefined();
  });
});

describe("suggest CTA", () => {
  it("renders the suggest-first-option button", () => {
    render(<EmptyPickView onSuggestOption={() => undefined} />);
    expect(
      screen.getByRole("button", { name: EMPTY_PICK_COPY.ctaButton }),
    ).toBeDefined();
  });

  it("calls onSuggestOption when the CTA is clicked", () => {
    const onSuggestOption = vi.fn();
    render(<EmptyPickView onSuggestOption={onSuggestOption} />);
    fireEvent.click(
      screen.getByRole("button", { name: EMPTY_PICK_COPY.ctaButton }),
    );
    expect(onSuggestOption).toHaveBeenCalledOnce();
  });
});
