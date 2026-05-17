import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SUGGEST_OPTION_SHEET_COPY } from "./SuggestOptionSheet.copy";
import { SuggestOptionSheetView } from "./SuggestOptionSheetView";

afterEach(cleanup);

function renderView(
  overrides?: Partial<Parameters<typeof SuggestOptionSheetView>[0]>,
) {
  const defaults = {
    title: "",
    onTitleChange: vi.fn(),
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    loading: false,
    error: undefined,
  };
  return render(<SuggestOptionSheetView {...defaults} {...overrides} />);
}

describe("sheet form fields", () => {
  it("renders the title input", () => {
    renderView();

    expect(
      screen.getByLabelText(SUGGEST_OPTION_SHEET_COPY.titleLabel),
    ).toBeDefined();
  });

  it("renders the suggest button", () => {
    renderView();

    expect(
      screen.getByRole("button", {
        name: SUGGEST_OPTION_SHEET_COPY.suggestButton,
      }),
    ).toBeDefined();
  });

  it("renders the cancel button", () => {
    renderView();

    expect(
      screen.getByRole("button", {
        name: SUGGEST_OPTION_SHEET_COPY.cancelButton,
      }),
    ).toBeDefined();
  });
});

describe("title input interaction", () => {
  it("calls onTitleChange when the user types in the input", () => {
    const onTitleChange = vi.fn();
    renderView({ onTitleChange });

    const input = screen.getByLabelText(SUGGEST_OPTION_SHEET_COPY.titleLabel);
    fireEvent.change(input, { target: { value: "Inception" } });

    expect(onTitleChange).toHaveBeenCalled();
  });

  it("reflects the title prop value in the input", () => {
    renderView({ title: "Inception" });

    const input = screen.getByLabelText<HTMLInputElement>(
      SUGGEST_OPTION_SHEET_COPY.titleLabel,
    );
    expect(input.value).toBe("Inception");
  });
});

describe("form submission", () => {
  it("calls onSubmit when the suggest button is clicked", () => {
    const onSubmit = vi.fn();
    renderView({ onSubmit, title: "Inception" });

    const button = screen.getByRole("button", {
      name: SUGGEST_OPTION_SHEET_COPY.suggestButton,
    });
    fireEvent.click(button);

    expect(onSubmit).toHaveBeenCalled();
  });
});

describe("cancel action", () => {
  it("calls onCancel when the cancel button is clicked", () => {
    const onCancel = vi.fn();
    renderView({ onCancel });

    const button = screen.getByRole("button", {
      name: SUGGEST_OPTION_SHEET_COPY.cancelButton,
    });
    fireEvent.click(button);

    expect(onCancel).toHaveBeenCalledOnce();
  });
});

describe("error display", () => {
  it("shows the error message when error is provided", () => {
    renderView({ error: SUGGEST_OPTION_SHEET_COPY.errors.default });

    expect(
      screen.getByText(SUGGEST_OPTION_SHEET_COPY.errors.default),
    ).toBeDefined();
  });

  it("does not show an error message when error is undefined", () => {
    renderView({ error: undefined });

    expect(
      screen.queryByText(SUGGEST_OPTION_SHEET_COPY.errors.default),
    ).toBeNull();
  });
});

describe("loading state", () => {
  it("disables the title input when loading", () => {
    renderView({ loading: true });

    const input = screen.getByLabelText<HTMLInputElement>(
      SUGGEST_OPTION_SHEET_COPY.titleLabel,
    );
    expect(input.disabled).toBe(true);
  });

  it("disables the suggest button when loading", () => {
    renderView({ loading: true });

    const button = screen.getByRole<HTMLButtonElement>("button", {
      name: SUGGEST_OPTION_SHEET_COPY.suggestButton,
    });
    expect(button.disabled).toBe(true);
  });

  it("disables the cancel button when loading", () => {
    renderView({ loading: true });

    const button = screen.getByRole<HTMLButtonElement>("button", {
      name: SUGGEST_OPTION_SHEET_COPY.cancelButton,
    });
    expect(button.disabled).toBe(true);
  });
});
