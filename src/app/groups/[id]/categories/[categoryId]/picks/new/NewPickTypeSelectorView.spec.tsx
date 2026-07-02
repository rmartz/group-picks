import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NewPickTypeSelectorView } from "./NewPickTypeSelectorView";
import { NEW_PICK_TYPE_SWITCHER_COPY } from "./NewPickTypeSwitcher.copy";

afterEach(cleanup);

describe("NewPickTypeSelectorView", () => {
  it("offers both a Standard pick and a Snap Pick option", () => {
    render(
      <NewPickTypeSelectorView
        pickType="standard"
        onPickTypeChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText(NEW_PICK_TYPE_SWITCHER_COPY.standard.label),
    ).toBeDefined();
    expect(
      screen.getByText(NEW_PICK_TYPE_SWITCHER_COPY.snap.label),
    ).toBeDefined();
  });

  it("marks the standard radio as checked when standard is selected", () => {
    render(
      <NewPickTypeSelectorView
        pickType="standard"
        onPickTypeChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("radio", {
        name: NEW_PICK_TYPE_SWITCHER_COPY.standard.label,
        checked: true,
      }),
    ).toBeDefined();
  });

  // TODO: upgrade to userEvent when @testing-library/user-event is available
  it("invokes onPickTypeChange with 'snap' when the Snap Pick option is chosen", () => {
    const onPickTypeChange = vi.fn();
    render(
      <NewPickTypeSelectorView
        pickType="standard"
        onPickTypeChange={onPickTypeChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("radio", {
        name: NEW_PICK_TYPE_SWITCHER_COPY.snap.label,
      }),
    );

    expect(onPickTypeChange).toHaveBeenCalledWith("snap");
  });
});
