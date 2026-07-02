import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  makeSnapPick,
  makeSnapPickActivation,
  makeSnapPickHistoryEntry,
} from "@/lib/fixtures/snap-pick";

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
        historyEntries={[]}
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
        historyEntries={[]}
      />,
    );

    expect(
      screen.getByText(SNAP_PICK_DETAIL_COPY.optionPoolHeading),
    ).toBeDefined();
    expect(
      screen.getByText(SNAP_PICK_DETAIL_COPY.activationHeading),
    ).toBeDefined();
    expect(screen.getByText(SNAP_PICK_DETAIL_COPY.votingHeading)).toBeDefined();
    expect(
      screen.getByText(SNAP_PICK_DETAIL_COPY.historyHeading),
    ).toBeDefined();
  });

  it("renders the history timeline of past activations", () => {
    render(
      <SnapPickDetailView
        snapPick={makeSnapPick()}
        groupId="group-1"
        currentUserId="user-1"
        options={[]}
        votedPairKeys={[]}
        historyEntries={[
          makeSnapPickHistoryEntry({
            activationId: "act-past",
            winnerTitle: "Ramen",
          }),
        ]}
      />,
    );

    expect(screen.getByText("Ramen")).toBeDefined();
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
        historyEntries={[]}
      />,
    );

    expect(
      screen.getByText(SNAP_PICK_DETAIL_COPY.optionPoolActivationNotice),
    ).toBeDefined();
  });
});
