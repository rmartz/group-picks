import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { makeSnapPick, makeSnapPickActivation } from "@/lib/fixtures/snap-pick";

import { SnapPickDetailView } from "./SnapPickDetailView";
import { SNAP_PICK_DETAIL_COPY } from "./SnapPickDetailView.copy";

// The activation panel calls useRouter; stub it so the detail shell renders.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => undefined }),
}));

afterEach(cleanup);

describe("renders the Snap Pick detail shell", () => {
  it("shows the snap pick title as the heading", () => {
    render(
      <SnapPickDetailView
        snapPick={makeSnapPick({ title: "Friday Lunch" })}
        groupId="group-1"
        currentUserId="user-1"
        options={[]}
        votedPairKeys={[]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Friday Lunch", level: 1 }),
    ).toBeDefined();
  });

  it("renders slots for the option pool, activation, and voting sections", () => {
    render(
      <SnapPickDetailView
        snapPick={makeSnapPick()}
        groupId="group-1"
        currentUserId="user-1"
        options={[]}
        votedPairKeys={[]}
      />,
    );

    expect(
      screen.getByText(SNAP_PICK_DETAIL_COPY.optionPoolHeading),
    ).toBeDefined();
    expect(
      screen.getByText(SNAP_PICK_DETAIL_COPY.activationHeading),
    ).toBeDefined();
    expect(screen.getByText(SNAP_PICK_DETAIL_COPY.votingHeading)).toBeDefined();
  });

  it("locks the option pool while an activation is in progress", () => {
    render(
      <SnapPickDetailView
        snapPick={makeSnapPick()}
        groupId="group-1"
        currentUserId="user-1"
        options={[]}
        activation={makeSnapPickActivation({ closedAt: undefined })}
        votedPairKeys={[]}
      />,
    );

    expect(
      screen.getByText(SNAP_PICK_DETAIL_COPY.optionPoolActivationNotice),
    ).toBeDefined();
  });
});
