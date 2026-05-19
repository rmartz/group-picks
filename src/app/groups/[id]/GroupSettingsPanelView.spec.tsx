import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GROUP_DETAIL_COPY } from "./copy";
import { GroupSettingsPanelView } from "./GroupSettingsPanelView";

afterEach(cleanup);

function makeProps(
  overrides?: Partial<Parameters<typeof GroupSettingsPanelView>[0]>,
) {
  return {
    picksRestricted: false,
    onTogglePicksRestricted: () => undefined,
    isSaving: false,
    error: undefined,
    ...overrides,
  };
}

describe("GroupSettingsPanelView", () => {
  it("renders the picks-restricted toggle label", () => {
    render(<GroupSettingsPanelView {...makeProps()} />);
    expect(
      screen.getByLabelText(GROUP_DETAIL_COPY.settings.picksRestrictedLabel),
    ).toBeDefined();
  });

  it("toggle is unchecked when picksRestricted is false", () => {
    render(
      <GroupSettingsPanelView {...makeProps({ picksRestricted: false })} />,
    );
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const toggle = screen.getByRole("checkbox", {
      name: GROUP_DETAIL_COPY.settings.picksRestrictedLabel,
    }) as HTMLInputElement;
    expect(toggle.checked).toBe(false);
  });

  it("toggle is checked when picksRestricted is true", () => {
    render(
      <GroupSettingsPanelView {...makeProps({ picksRestricted: true })} />,
    );
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const toggle = screen.getByRole("checkbox", {
      name: GROUP_DETAIL_COPY.settings.picksRestrictedLabel,
    }) as HTMLInputElement;
    expect(toggle.checked).toBe(true);
  });

  it("calls onTogglePicksRestricted when toggle is clicked", () => {
    const onToggle = vi.fn();
    render(
      <GroupSettingsPanelView
        {...makeProps({ onTogglePicksRestricted: onToggle })}
      />,
    );
    fireEvent.click(
      screen.getByLabelText(GROUP_DETAIL_COPY.settings.picksRestrictedLabel),
    );
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("disables the toggle while saving", () => {
    render(<GroupSettingsPanelView {...makeProps({ isSaving: true })} />);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const toggle = screen.getByLabelText(
      GROUP_DETAIL_COPY.settings.picksRestrictedLabel,
    ) as HTMLInputElement;
    expect(toggle.disabled).toBe(true);
  });

  it("renders an error message when provided", () => {
    render(
      <GroupSettingsPanelView
        {...makeProps({ error: GROUP_DETAIL_COPY.settings.error })}
      />,
    );
    expect(screen.getByText(GROUP_DETAIL_COPY.settings.error)).toBeDefined();
  });
});
