import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { makeSnapPick } from "@/lib/fixtures/snap-pick";

import { SnapPickDetailView } from "./SnapPickDetailView";
import { SNAP_PICK_DETAIL_COPY } from "./SnapPickDetailView.copy";

afterEach(cleanup);

describe("renders the Snap Pick detail shell", () => {
  it("shows the snap pick title as the heading", () => {
    render(
      <SnapPickDetailView snapPick={makeSnapPick({ title: "Friday Lunch" })} />,
    );

    expect(
      screen.getByRole("heading", { name: "Friday Lunch", level: 1 }),
    ).toBeDefined();
  });

  it("renders slots for the option pool, activation, and voting sections", () => {
    render(<SnapPickDetailView snapPick={makeSnapPick()} />);

    expect(
      screen.getByText(SNAP_PICK_DETAIL_COPY.optionPoolHeading),
    ).toBeDefined();
    expect(
      screen.getByText(SNAP_PICK_DETAIL_COPY.activationHeading),
    ).toBeDefined();
    expect(screen.getByText(SNAP_PICK_DETAIL_COPY.votingHeading)).toBeDefined();
  });
});
