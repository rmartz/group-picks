import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// TODO: upgrade to userEvent when @testing-library/user-event is available
import { makeSnapPickOption } from "@/lib/fixtures/snap-pick";

import { SNAP_PICK_MATCHUP_COPY } from "./SnapPickMatchup.copy";
import { SnapPickMatchupView } from "./SnapPickMatchupView";

afterEach(cleanup);

const noop = () => undefined;

const left = makeSnapPickOption({ id: "opt-a", title: "Pizza" });
const right = makeSnapPickOption({ id: "opt-b", title: "Tacos" });

function renderView(
  overrides?: Partial<React.ComponentProps<typeof SnapPickMatchupView>>,
) {
  return render(
    <SnapPickMatchupView
      left={left}
      right={right}
      completed={0}
      total={3}
      pool={[left, right]}
      loading={false}
      error={undefined}
      onChoose={noop}
      {...overrides}
    />,
  );
}

describe("Members see a head-to-head matchup", () => {
  it("renders a choose control for each option", () => {
    renderView();

    expect(
      screen.getByRole("button", {
        name: `${SNAP_PICK_MATCHUP_COPY.chooseLabel}: Pizza`,
      }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", {
        name: `${SNAP_PICK_MATCHUP_COPY.chooseLabel}: Tacos`,
      }),
    ).toBeDefined();
  });

  it("shows the progress indicator for the run", () => {
    renderView({ completed: 2, total: 5 });

    expect(
      screen.getByText(SNAP_PICK_MATCHUP_COPY.progress(2, 5)),
    ).toBeDefined();
  });
});

describe("Tapping a card records the choice", () => {
  it("calls onChoose with the tapped option as winner and the other as loser", () => {
    const onChoose = vi.fn();
    renderView({ onChoose });

    fireEvent.click(
      screen.getByRole("button", {
        name: `${SNAP_PICK_MATCHUP_COPY.chooseLabel}: Pizza`,
      }),
    );

    expect(onChoose).toHaveBeenCalledWith("opt-a", "opt-b");
  });
});

describe("Completion state", () => {
  it("shows the done message and the option pool when the queue is empty", () => {
    renderView({
      left: undefined,
      right: undefined,
      completed: 3,
      total: 3,
    });

    expect(
      screen.getByText(SNAP_PICK_MATCHUP_COPY.completionHeading),
    ).toBeDefined();
    expect(screen.getByText("Pizza")).toBeDefined();
    expect(screen.getByText("Tacos")).toBeDefined();
  });
});

describe("Insufficient options", () => {
  it("shows the no-matchups message when the run has no pairs", () => {
    renderView({ left: undefined, right: undefined, total: 0 });

    expect(
      screen.getByText(SNAP_PICK_MATCHUP_COPY.noMatchupsMessage),
    ).toBeDefined();
  });
});
