import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { makeSnapPickHistoryEntry } from "@/lib/fixtures/snap-pick";

import { SNAP_PICK_HISTORY_COPY } from "./SnapPickHistory.copy";
import { SnapPickHistoryView } from "./SnapPickHistoryView";

afterEach(cleanup);

describe("empty state when no activations have closed", () => {
  it("shows the empty-state message and no list", () => {
    render(<SnapPickHistoryView entries={[]} />);

    expect(screen.getByText(SNAP_PICK_HISTORY_COPY.emptyState)).toBeDefined();
    expect(screen.queryByRole("list")).toBeNull();
  });
});

describe("each entry shows winner, date, and participant count", () => {
  it("renders the winning option title, close date, and voter count", () => {
    render(
      <SnapPickHistoryView
        entries={[
          makeSnapPickHistoryEntry({
            activationId: "act-9",
            winnerTitle: "Tacos",
            participantCount: 4,
            closedAt: new Date("2025-03-22T00:00:00.000Z"),
          }),
        ]}
      />,
    );

    const item = screen.getByRole("listitem");
    expect(item.textContent).toContain("Tacos");
    expect(item.textContent).toContain(
      SNAP_PICK_HISTORY_COPY.participantCount(4),
    );
    expect(item.textContent).toContain("2025");
  });

  it("falls back to the no-winner label when a run closed without a winner", () => {
    render(
      <SnapPickHistoryView
        entries={[
          makeSnapPickHistoryEntry({
            activationId: "act-tie",
            winnerTitle: undefined,
          }),
        ]}
      />,
    );

    expect(
      screen.getByText(SNAP_PICK_HISTORY_COPY.noWinnerTitle),
    ).toBeDefined();
  });
});

describe("frequency summary sorted by win count", () => {
  it("lists top picks with their win counts in descending order", () => {
    render(
      <SnapPickHistoryView
        entries={[
          makeSnapPickHistoryEntry({
            activationId: "a1",
            winnerTitle: "Pizza",
          }),
          makeSnapPickHistoryEntry({
            activationId: "a2",
            winnerTitle: "Tacos",
          }),
          makeSnapPickHistoryEntry({
            activationId: "a3",
            winnerTitle: "Pizza",
          }),
          makeSnapPickHistoryEntry({
            activationId: "a4",
            winnerTitle: "Pizza",
          }),
          makeSnapPickHistoryEntry({
            activationId: "a5",
            winnerTitle: "Tacos",
          }),
        ]}
      />,
    );

    const summary = screen.getByTestId("snap-pick-history-summary");
    const text = summary.textContent;
    expect(text).toContain(SNAP_PICK_HISTORY_COPY.topPicksLabel);
    const pizzaIndex = text.indexOf(
      SNAP_PICK_HISTORY_COPY.winCount("Pizza", 3),
    );
    const tacosIndex = text.indexOf(
      SNAP_PICK_HISTORY_COPY.winCount("Tacos", 2),
    );
    expect(pizzaIndex).toBeGreaterThanOrEqual(0);
    expect(tacosIndex).toBeGreaterThanOrEqual(0);
    expect(pizzaIndex).toBeLessThan(tacosIndex);
  });

  it("omits the frequency summary when no entry has a winner", () => {
    render(
      <SnapPickHistoryView
        entries={[
          makeSnapPickHistoryEntry({
            activationId: "a1",
            winnerTitle: undefined,
          }),
        ]}
      />,
    );

    expect(screen.queryByTestId("snap-pick-history-summary")).toBeNull();
  });
});
