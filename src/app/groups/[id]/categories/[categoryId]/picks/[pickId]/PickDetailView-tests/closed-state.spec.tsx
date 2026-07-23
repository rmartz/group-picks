import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CLOSED_PICK_RESULTS_COPY } from "../ClosedPickResultsView.copy";
import { PICK_DETAIL_SCAFFOLD_COPY } from "../copy";
import { PickDetailView } from "../PickDetailView";
import { TOP_PICKS_VIEW_COPY } from "../TopPicksView.copy";
import { makeEntry, makePick } from "./helpers";

afterEach(() => {
  cleanup();
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/services/rankings", () => ({
  saveRankings: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/services/picks", () => ({
  reopenPick: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../OptionList", () => ({
  OptionList: () => <div data-testid="option-list" />,
}));

vi.mock("../SuggestOptionSheet", () => ({
  SuggestOptionSheet: () => null,
}));

let capturedOnReopen: (() => void) | undefined;

vi.mock("../ClosedPickResultsView", () => ({
  ClosedPickResultsView: ({
    onReopen,
    isReopening,
    reopenError,
  }: {
    onReopen?: () => void;
    isReopening?: boolean;
    reopenError?: string;
  }) => {
    capturedOnReopen = onReopen;
    return (
      <div
        data-testid="closed-pick-results-view"
        data-is-reopening={isReopening}
      >
        {onReopen !== undefined && (
          <button type="button" onClick={onReopen}>
            {CLOSED_PICK_RESULTS_COPY.reopenCard.button}
          </button>
        )}
        {reopenError && <p>{reopenError}</p>}
      </div>
    );
  },
}));

function renderView(overrides?: Partial<Parameters<typeof PickDetailView>[0]>) {
  capturedOnReopen = undefined;
  return render(
    <PickDetailView
      pick={makePick()}
      groupId="group-1"
      groupName="Movie Night"
      categoryId="cat-1"
      currentUserId="user-1"
      initialOptions={[]}
      initialSuggestions={[]}
      closedPickResults={{ topPicks: [], runnersUp: [] }}
      {...overrides}
    />,
  );
}

describe("closed state: status chip shows Closed", () => {
  it("renders the closed status chip when pick.closedAt is set", () => {
    renderView({
      pick: makePick({ closedAt: new Date("2025-06-01T00:00:00.000Z") }),
    });

    expect(
      screen.getByText(PICK_DETAIL_SCAFFOLD_COPY.closedStatusChip),
    ).toBeDefined();
  });
});

describe("closed state: renders ClosedPickResultsView", () => {
  it("renders ClosedPickResultsView in top-picks tab when closed", () => {
    renderView({
      pick: makePick({ closedAt: new Date("2025-06-01T00:00:00.000Z") }),
    });

    expect(screen.getByTestId("closed-pick-results-view")).toBeDefined();
  });

  it("does not render the locked placeholder when closed", () => {
    renderView({
      pick: makePick({ closedAt: new Date("2025-06-01T00:00:00.000Z") }),
    });

    expect(screen.queryByText(TOP_PICKS_VIEW_COPY.lockedMessage)).toBeNull();
  });

  it("passes closedPickResults entries to ClosedPickResultsView", () => {
    const entry = makeEntry("opt-1", "Movie Alpha", 1, 5);
    renderView({
      pick: makePick({ closedAt: new Date("2025-06-01T00:00:00.000Z") }),
      closedPickResults: { topPicks: [entry], runnersUp: [] },
    });

    expect(screen.getByTestId("closed-pick-results-view")).toBeDefined();
  });
});

describe("closed state: re-open card admin gating", () => {
  it("passes onReopen to ClosedPickResultsView when the user is an admin", () => {
    renderView({
      pick: makePick({ closedAt: new Date("2025-06-01T00:00:00.000Z") }),
      isAdmin: true,
    });

    expect(capturedOnReopen).toBeDefined();
  });

  it("does not pass onReopen to ClosedPickResultsView when the user is not an admin", () => {
    renderView({
      pick: makePick({ closedAt: new Date("2025-06-01T00:00:00.000Z") }),
      isAdmin: false,
    });

    expect(capturedOnReopen).toBeUndefined();
  });
});

describe("closed state: re-open wiring", () => {
  it("passes onReopen to ClosedPickResultsView when closed", () => {
    renderView({
      pick: makePick({ closedAt: new Date("2025-06-01T00:00:00.000Z") }),
      isAdmin: true,
    });

    expect(capturedOnReopen).toBeDefined();
  });

  it("re-open button calls the reopen handler", async () => {
    const { reopenPick: mockReopenPick } = await import("@/services/picks");

    renderView({
      pick: makePick({ closedAt: new Date("2025-06-01T00:00:00.000Z") }),
      isAdmin: true,
    });

    // Navigate to the Top picks tab to make its content active
    fireEvent.click(
      screen.getByRole("tab", {
        name: PICK_DETAIL_SCAFFOLD_COPY.tabs.topPicks,
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: CLOSED_PICK_RESULTS_COPY.reopenCard.button,
      }),
    );

    await vi.waitFor(() => {
      expect(mockReopenPick).toHaveBeenCalledWith("group-1", "cat-1", "pick-1");
    });
  });

  it("passes isReopening=true to ClosedPickResultsView while the API call is in flight", async () => {
    let resolveReopen: (() => void) | undefined;
    const { reopenPick: mockReopenPick } = await import("@/services/picks");
    vi.mocked(mockReopenPick).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveReopen = resolve;
        }),
    );

    renderView({
      pick: makePick({ closedAt: new Date("2025-06-01T00:00:00.000Z") }),
      isAdmin: true,
    });

    fireEvent.click(
      screen.getByRole("tab", {
        name: PICK_DETAIL_SCAFFOLD_COPY.tabs.topPicks,
      }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: CLOSED_PICK_RESULTS_COPY.reopenCard.button,
      }),
    );

    await vi.waitFor(() => {
      expect(
        screen.getByTestId("closed-pick-results-view").dataset["isReopening"],
      ).toBe("true");
    });

    act(() => {
      resolveReopen?.();
    });

    await vi.waitFor(() => {
      expect(
        screen.getByTestId("closed-pick-results-view").dataset["isReopening"],
      ).toBe("false");
    });
  });

  it("surfaces the error message when reopenPick rejects", async () => {
    const { reopenPick: mockReopenPick } = await import("@/services/picks");
    vi.mocked(mockReopenPick).mockRejectedValueOnce(new Error("Network error"));

    renderView({
      pick: makePick({ closedAt: new Date("2025-06-01T00:00:00.000Z") }),
      isAdmin: true,
    });

    fireEvent.click(
      screen.getByRole("tab", {
        name: PICK_DETAIL_SCAFFOLD_COPY.tabs.topPicks,
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: CLOSED_PICK_RESULTS_COPY.reopenCard.button,
      }),
    );

    await vi.waitFor(() => {
      expect(screen.getByText("Network error")).toBeDefined();
    });
  });
});
