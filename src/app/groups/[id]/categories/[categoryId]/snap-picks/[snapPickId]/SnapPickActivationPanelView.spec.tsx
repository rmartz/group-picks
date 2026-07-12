import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// TODO: upgrade to userEvent when @testing-library/user-event is available
import { SNAP_PICK_ACTIVATION_COPY } from "./SnapPickActivationPanel.copy";
import { SnapPickActivationPanelView } from "./SnapPickActivationPanelView";

afterEach(cleanup);

const noop = () => undefined;

function renderView(
  overrides?: Partial<React.ComponentProps<typeof SnapPickActivationPanelView>>,
) {
  return render(
    <SnapPickActivationPanelView
      activeClosesAt={undefined}
      lastWinnerTitle={undefined}
      hasClosedRun={false}
      selection="same-day"
      customMinutes=""
      loading={false}
      error={undefined}
      onSelectionChange={noop}
      onCustomMinutesChange={noop}
      onStart={noop}
      {...overrides}
    />,
  );
}

describe("Start a pick button when no activation exists", () => {
  it("shows the start button and duration selector when idle", () => {
    renderView();

    expect(
      screen.getByRole("button", {
        name: SNAP_PICK_ACTIVATION_COPY.startButton,
      }),
    ).toBeDefined();
    expect(
      screen.getByLabelText(SNAP_PICK_ACTIVATION_COPY.durationLabel),
    ).toBeDefined();
  });

  it("calls onStart when the start button is clicked", () => {
    const onStart = vi.fn();
    renderView({ onStart });

    fireEvent.click(
      screen.getByRole("button", {
        name: SNAP_PICK_ACTIVATION_COPY.startButton,
      }),
    );

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("hides the start button while an activation is in progress", () => {
    renderView({ activeClosesAt: new Date("2025-03-22T00:00:00.000Z") });

    expect(
      screen.queryByRole("button", {
        name: SNAP_PICK_ACTIVATION_COPY.startButton,
      }),
    ).toBeNull();
    expect(
      screen.getByText(SNAP_PICK_ACTIVATION_COPY.inProgressHeading),
    ).toBeDefined();
  });
});

describe("Duration selector options", () => {
  it("offers same-day, hour presets, and custom", () => {
    renderView();

    for (const label of Object.values(
      SNAP_PICK_ACTIVATION_COPY.durationOptions,
    )) {
      expect(screen.getByRole("option", { name: label })).toBeDefined();
    }
  });

  it("reveals the custom-minutes input when custom is selected", () => {
    renderView({ selection: "custom" });

    expect(
      screen.getByLabelText(SNAP_PICK_ACTIVATION_COPY.customLabel),
    ).toBeDefined();
  });
});

describe("Winner display after close", () => {
  it("shows the winning option title prominently", () => {
    renderView({ hasClosedRun: true, lastWinnerTitle: "Tacos" });

    expect(
      screen.getByText(SNAP_PICK_ACTIVATION_COPY.winnerHeading),
    ).toBeDefined();
    expect(screen.getByText("Tacos")).toBeDefined();
  });

  it("shows an explicit no-votes message when a closed run had no winner", () => {
    renderView({ hasClosedRun: true, lastWinnerTitle: undefined });

    expect(
      screen.getByText(SNAP_PICK_ACTIVATION_COPY.noVotesMessage),
    ).toBeDefined();
  });

  it("omits the winner heading when a closed run had no votes", () => {
    renderView({ hasClosedRun: true, lastWinnerTitle: undefined });

    expect(
      screen.queryByText(SNAP_PICK_ACTIVATION_COPY.winnerHeading),
    ).toBeNull();
  });
});
