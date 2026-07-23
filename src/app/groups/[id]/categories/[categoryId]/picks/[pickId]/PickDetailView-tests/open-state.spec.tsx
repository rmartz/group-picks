import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PICK_DETAIL_SCAFFOLD_COPY } from "../copy";
import { PickDetailView } from "../PickDetailView";
import type { SuggestOptionSheetProps } from "../SuggestOptionSheet";
import { TOP_PICKS_VIEW_COPY } from "../TopPicksView.copy";
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

  it("renders top picks tab as locked placeholder when open", () => {
    renderView({ pick: makePick({ closedAt: undefined }) });

    expect(screen.getByText(TOP_PICKS_VIEW_COPY.lockedMessage)).toBeDefined();
  });

  it("does not show the locked message in the options tab panel", () => {
    renderView({ pick: makePick({ closedAt: undefined }) });

    const optionsPanel = screen.getByRole("tabpanel");
    expect(
      within(optionsPanel).queryByText(TOP_PICKS_VIEW_COPY.lockedMessage),
    ).toBeNull();
  });

  it("does not show the locked message in the ranking tab panel", () => {
    renderView({ pick: makePick({ closedAt: undefined }) });

    fireEvent.click(
      screen.getByRole("tab", { name: PICK_DETAIL_SCAFFOLD_COPY.tabs.ranking }),
    );

    const rankingPanel = screen.getByRole("tabpanel");
    expect(
      within(rankingPanel).queryByText(TOP_PICKS_VIEW_COPY.lockedMessage),
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
