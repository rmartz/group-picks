import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ClosedPickResultEntry } from "@/lib/ranking-score";
import type { Option } from "@/lib/types/option";

import { ClosedPickResultsView } from "./ClosedPickResultsView";
import { CLOSED_PICK_RESULTS_COPY } from "./ClosedPickResultsView.copy";

afterEach(cleanup);

function makeOption(id: string, title: string): Option {
  return { id, title, pickId: "pick-1", ownerIds: ["user-1"] };
}

function makeEntry(
  id: string,
  title: string,
  rank: number,
  score: number,
): ClosedPickResultEntry {
  return { option: makeOption(id, title), rank, score };
}

function renderView(
  overrides?: Partial<Parameters<typeof ClosedPickResultsView>[0]>,
) {
  return render(
    <ClosedPickResultsView
      topCount={3}
      topPicks={[makeEntry("opt-1", "Movie Alpha", 1, 3)]}
      runnersUp={[]}
      {...overrides}
    />,
  );
}

describe("closed chip and metadata", () => {
  it("renders the closed chip", () => {
    renderView();
    expect(screen.getByText(CLOSED_PICK_RESULTS_COPY.closedChip)).toBeDefined();
  });

  it("renders the top-N count in the header", () => {
    renderView({ topCount: 5 });
    expect(screen.getByText("5")).toBeDefined();
  });
});

describe("no results state", () => {
  it("renders the no-results message when topPicks is empty", () => {
    renderView({ topPicks: [], runnersUp: [] });
    expect(
      screen.getByText(CLOSED_PICK_RESULTS_COPY.noResultsMessage),
    ).toBeDefined();
  });
});

describe("top picks list", () => {
  it("renders each top pick's title", () => {
    renderView({
      topPicks: [
        makeEntry("opt-1", "Movie Alpha", 1, 3),
        makeEntry("opt-2", "Movie Beta", 2, 2),
      ],
    });
    expect(screen.getByText("Movie Alpha")).toBeDefined();
    expect(screen.getByText("Movie Beta")).toBeDefined();
  });

  it("renders each top pick's score", () => {
    renderView({
      topPicks: [makeEntry("opt-1", "Movie Alpha", 1, 4)],
    });
    expect(screen.getByText("4")).toBeDefined();
  });

  it("renders a rank badge for each top pick", () => {
    renderView({
      topPicks: [makeEntry("opt-1", "Movie Alpha", 1, 3)],
    });
    expect(screen.getByText("#1")).toBeDefined();
  });

  it("renders the winner crown on rank-1 options", () => {
    renderView({
      topPicks: [
        makeEntry("opt-1", "Movie Alpha", 1, 3),
        makeEntry("opt-2", "Movie Beta", 2, 2),
      ],
    });
    // Crown emoji present in the document (appears once for rank-1)
    expect(document.body.textContent).toContain("👑");
  });

  it("does not render the crown on non-rank-1 options", () => {
    renderView({
      topPicks: [makeEntry("opt-1", "Movie Alpha", 2, 2)],
    });
    expect(document.body.textContent).not.toContain("👑");
  });
});

describe("tie callout", () => {
  it("renders the tie label for tied options", () => {
    renderView({
      topPicks: [
        makeEntry("opt-1", "Movie Alpha", 1, 3),
        makeEntry("opt-2", "Movie Beta", 1, 3),
      ],
    });
    expect(
      screen.getByText(`${CLOSED_PICK_RESULTS_COPY.tieLabel} 1`),
    ).toBeDefined();
  });

  it("does not render the tie label when no ties exist", () => {
    renderView({
      topPicks: [
        makeEntry("opt-1", "Movie Alpha", 1, 3),
        makeEntry("opt-2", "Movie Beta", 2, 2),
      ],
    });
    expect(
      screen.queryByText(`${CLOSED_PICK_RESULTS_COPY.tieLabel} 1`),
    ).toBeNull();
  });
});

describe("runners-up section", () => {
  it("renders the runners-up heading when runnersUp is non-empty", () => {
    renderView({
      runnersUp: [makeEntry("opt-3", "Movie Gamma", 4, 1)],
    });
    expect(
      screen.getByText(CLOSED_PICK_RESULTS_COPY.runnersUpHeading),
    ).toBeDefined();
  });

  it("does not render the runners-up heading when runnersUp is empty", () => {
    renderView({ runnersUp: [] });
    expect(
      screen.queryByText(CLOSED_PICK_RESULTS_COPY.runnersUpHeading),
    ).toBeNull();
  });

  it("renders each runner-up title", () => {
    renderView({
      runnersUp: [makeEntry("opt-3", "Movie Gamma", 4, 1)],
    });
    expect(screen.getByText("Movie Gamma")).toBeDefined();
  });
});

describe("re-open action card", () => {
  it("renders the re-open card heading when onReopen is provided", () => {
    renderView({ onReopen: vi.fn() });
    expect(
      screen.getByText(CLOSED_PICK_RESULTS_COPY.reopenCard.heading),
    ).toBeDefined();
  });

  it("does not render the re-open card when onReopen is absent", () => {
    renderView({ onReopen: undefined });
    expect(
      screen.queryByText(CLOSED_PICK_RESULTS_COPY.reopenCard.heading),
    ).toBeNull();
  });

  it("calls onReopen when the Re-open button is clicked", () => {
    const onReopen = vi.fn();
    renderView({ onReopen });
    fireEvent.click(
      screen.getByRole("button", {
        name: CLOSED_PICK_RESULTS_COPY.reopenCard.button,
      }),
    );
    expect(onReopen).toHaveBeenCalledOnce();
  });

  it("disables the Re-open button when isReopening is true", () => {
    renderView({ onReopen: vi.fn(), isReopening: true });
    expect(
      screen.getByRole("button", {
        name: CLOSED_PICK_RESULTS_COPY.reopenCard.button,
      }),
    ).toHaveProperty("disabled", true);
  });

  it("enables the Re-open button when isReopening is false", () => {
    renderView({ onReopen: vi.fn(), isReopening: false });
    expect(
      screen.getByRole("button", {
        name: CLOSED_PICK_RESULTS_COPY.reopenCard.button,
      }),
    ).toHaveProperty("disabled", false);
  });

  it("renders the error message when reopenError is provided", () => {
    renderView({
      onReopen: vi.fn(),
      reopenError: "Network error",
    });
    expect(screen.getByTestId("reopen-error").textContent).toBe(
      "Network error",
    );
  });

  it("does not render an error message when reopenError is absent", () => {
    renderView({ onReopen: vi.fn() });
    expect(screen.queryByTestId("reopen-error")).toBeNull();
  });
});
