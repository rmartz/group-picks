import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PICK_DETAIL_SCAFFOLD_COPY } from "../copy";
import { LOCKED_TOP_PICKS_COPY } from "../LockedTopPicks.copy";
import { PickDetailView } from "../PickDetailView";
import type { SuggestOptionSheetProps } from "../SuggestOptionSheet";
import { makePick, makeSuggestedOptionPayload } from "./helpers";

let mockSuggestedOption = makeSuggestedOptionPayload();

afterEach(() => {
  cleanup();
  mockSuggestedOption = makeSuggestedOptionPayload();
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
  SuggestOptionSheet: ({ open, onOptionAdded }: SuggestOptionSheetProps) =>
    open ? (
      <div data-testid="suggest-option-sheet">
        <button
          type="button"
          onClick={() => {
            onOptionAdded(mockSuggestedOption);
          }}
        >
          mock-add-option
        </button>
      </div>
    ) : null,
}));

vi.mock("../ClosedPickResultsView", () => ({
  ClosedPickResultsView: () => <div data-testid="closed-pick-results-view" />,
}));

function renderView(overrides?: Partial<Parameters<typeof PickDetailView>[0]>) {
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

describe("open state", () => {
  it("renders the open status chip when pick is not closed", () => {
    renderView({ pick: makePick({ closedAt: undefined }) });

    expect(
      screen.getByText(PICK_DETAIL_SCAFFOLD_COPY.openStatusChip),
    ).toBeDefined();
  });

  it("renders the suggest option button when open", () => {
    renderView({ pick: makePick({ closedAt: undefined }) });

    expect(
      screen.getByRole("button", {
        name: PICK_DETAIL_SCAFFOLD_COPY.suggestOptionButton,
      }),
    ).toBeDefined();
  });

  it("opens the suggest sheet when the header button is clicked", () => {
    renderView();

    fireEvent.click(
      screen.getByRole("button", {
        name: PICK_DETAIL_SCAFFOLD_COPY.suggestOptionButton,
      }),
    );

    expect(screen.getByTestId("suggest-option-sheet")).toBeDefined();
  });

  it("renders live results (not the lock screen) for an open pick with results visible", () => {
    renderView({
      pick: makePick({ closedAt: undefined, resultsVisible: true }),
    });

    expect(screen.getByTestId("closed-pick-results-view")).toBeDefined();
    expect(screen.queryByText(LOCKED_TOP_PICKS_COPY.title)).toBeNull();
  });

  it("renders the lock screen for an open pick with results hidden", () => {
    renderView({
      pick: makePick({ closedAt: undefined, resultsVisible: false }),
    });

    expect(screen.getByText(LOCKED_TOP_PICKS_COPY.title)).toBeDefined();
    expect(screen.getByText(LOCKED_TOP_PICKS_COPY.explanation)).toBeDefined();
    expect(screen.getByText(LOCKED_TOP_PICKS_COPY.adminNote)).toBeDefined();
    expect(screen.queryByTestId("closed-pick-results-view")).toBeNull();
  });

  it("does not show the lock screen in the options tab panel", () => {
    renderView({
      pick: makePick({ closedAt: undefined, resultsVisible: false }),
    });

    const optionsPanel = screen.getByRole("tabpanel");
    expect(
      within(optionsPanel).queryByText(LOCKED_TOP_PICKS_COPY.title),
    ).toBeNull();
  });

  it("does not render the suggest option button when closed", () => {
    renderView({
      pick: makePick({ closedAt: new Date("2025-06-01T00:00:00.000Z") }),
    });

    expect(
      screen.queryByRole("button", {
        name: PICK_DETAIL_SCAFFOLD_COPY.suggestOptionButton,
      }),
    ).toBeNull();
  });
});
