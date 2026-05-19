import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Option } from "@/lib/types/option";
import type { GroupPick } from "@/lib/types/pick";

vi.mock("@/services/rankings", () => ({
  saveRankings: vi.fn().mockResolvedValue(undefined),
}));

import { CATEGORY_DETAIL_COPY } from "../../copy";
import { PICK_DETAIL_SCAFFOLD_COPY } from "./copy";
import { EMPTY_PICK_COPY } from "./EmptyPickView.copy";
import { PickDetailView } from "./PickDetailView";
import type { SuggestOptionSheetProps } from "./SuggestOptionSheet";
import { TOP_PICKS_VIEW_COPY } from "./TopPicksView.copy";

let capturedOnOptionsChange: ((options: Option[]) => void) | undefined;

function makeSuggestedOptionPayload(overrides?: {
  optionId?: string;
  title?: string;
}) {
  return {
    optionId: "opt-new",
    title: "New Option",
    ...overrides,
  };
}

let mockSuggestedOption = makeSuggestedOptionPayload();

afterEach(() => {
  cleanup();
  capturedOnOptionsChange = undefined;
  mockSuggestedOption = makeSuggestedOptionPayload();
});

vi.mock("./OptionList", () => ({
  OptionList: ({
    onOptionsChange,
  }: {
    onOptionsChange?: (options: Option[]) => void;
  }) => {
    capturedOnOptionsChange = onOptionsChange;
    return <div data-testid="option-list" />;
  },
}));

vi.mock("./SuggestOptionSheet", () => ({
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

vi.mock("../../ReopenPickButton", () => ({
  ReopenPickButton: () => (
    <button>{CATEGORY_DETAIL_COPY.reopenPickButton}</button>
  ),
}));

function makePick(overrides?: Partial<GroupPick>): GroupPick {
  return {
    id: "pick-1",
    title: "Best Movie of 2025",
    topCount: 3,
    categoryId: "cat-1",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    creatorId: "user-1",
    ...overrides,
  };
}

function makeOption(overrides: Partial<Option> = {}): Option {
  return {
    id: "opt-1",
    title: "Option A",
    pickId: "pick-1",
    ownerIds: ["user-1"],
    ...overrides,
  };
}

function renderView(overrides?: Partial<Parameters<typeof PickDetailView>[0]>) {
  return render(
    <PickDetailView
      pick={makePick()}
      groupId="group-1"
      categoryId="cat-1"
      currentUserId="user-1"
      initialOptions={[]}
      initialSuggestions={[]}
      topPicks={[]}
      {...overrides}
    />,
  );
}

describe("pick metadata", () => {
  it("renders the pick title", () => {
    const pick = makePick({ title: "Best Movie of 2025" });
    renderView({ pick });

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Best Movie of 2025",
    );
  });

  it("renders the top-N indicator", () => {
    renderView({ pick: makePick({ topCount: 3 }) });

    expect(
      screen.getByText(PICK_DETAIL_SCAFFOLD_COPY.topCountLabel),
    ).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
  });
});

describe("tabs structure", () => {
  it("renders the Options tab", () => {
    renderView();

    expect(
      screen.getByRole("tab", { name: PICK_DETAIL_SCAFFOLD_COPY.tabs.options }),
    ).toBeDefined();
  });

  it("renders OptionList in the Options tab panel when options exist", () => {
    renderView({ initialOptions: [makeOption()] });

    expect(screen.getByTestId("option-list")).toBeDefined();
  });

  it("renders the Your ranking tab", () => {
    renderView();

    expect(
      screen.getByRole("tab", {
        name: PICK_DETAIL_SCAFFOLD_COPY.tabs.ranking,
      }),
    ).toBeDefined();
  });

  it("renders the Top picks tab", () => {
    renderView();

    expect(
      screen.getByRole("tab", {
        name: PICK_DETAIL_SCAFFOLD_COPY.tabs.topPicks,
      }),
    ).toBeDefined();
  });
});

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

  it("does not render the reopen button when open", () => {
    renderView({ pick: makePick({ closedAt: undefined }) });

    expect(
      screen.queryByRole("button", {
        name: CATEGORY_DETAIL_COPY.reopenPickButton,
      }),
    ).toBeNull();
  });
});

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

describe("closed state: top picks shows results placeholder", () => {
  it("renders results placeholder instead of locked message when closed", () => {
    renderView({
      pick: makePick({ closedAt: new Date("2025-06-01T00:00:00.000Z") }),
    });

    expect(
      screen.getByText(TOP_PICKS_VIEW_COPY.noResultsMessage),
    ).toBeDefined();
    expect(screen.queryByText(TOP_PICKS_VIEW_COPY.lockedMessage)).toBeNull();
  });
});

describe("closed state: reopen button for group members", () => {
  it("shows reopen button for the pick creator", () => {
    renderView({
      pick: makePick({ closedAt: new Date("2025-06-01T00:00:00.000Z") }),
      currentUserId: "user-1",
    });

    expect(
      screen.getByRole("button", {
        name: CATEGORY_DETAIL_COPY.reopenPickButton,
      }),
    ).toBeDefined();
  });

  it("shows reopen button for non-creator members", () => {
    renderView({
      pick: makePick({ closedAt: new Date("2025-06-01T00:00:00.000Z") }),
      currentUserId: "user-2",
    });

    expect(
      screen.getByRole("button", {
        name: CATEGORY_DETAIL_COPY.reopenPickButton,
      }),
    ).toBeDefined();
  });
});

describe("ranking tab live options sync", () => {
  it("reflects in-session options changes in the ranking tab", () => {
    const initialOption = makeOption({
      id: "opt-initial",
      title: "Initial Option",
      ownerIds: ["user-1"],
    });

    renderView({
      currentUserId: "user-1",
      initialOptions: [initialOption],
    });

    const newOption: Option = {
      id: "opt-new",
      title: "Newly Adopted Option",
      pickId: "pick-1",
      ownerIds: ["user-1"],
    };

    act(() => {
      capturedOnOptionsChange?.([initialOption, newOption]);
    });

    fireEvent.click(
      screen.getByRole("tab", { name: PICK_DETAIL_SCAFFOLD_COPY.tabs.ranking }),
    );

    expect(screen.getByText("Newly Adopted Option")).toBeDefined();
  });

  it("removes a dehearted option from the ranking tab", () => {
    const option = makeOption({
      id: "opt-1",
      title: "Option To Remove",
      ownerIds: ["user-1"],
    });

    renderView({
      currentUserId: "user-1",
      initialOptions: [option],
    });

    act(() => {
      capturedOnOptionsChange?.([]);
    });

    fireEvent.click(
      screen.getByRole("tab", { name: PICK_DETAIL_SCAFFOLD_COPY.tabs.ranking }),
    );

    expect(screen.queryByText("Option To Remove")).toBeNull();
  });
});

describe("options tab", () => {
  it("renders OptionList when options exist", () => {
    renderView({ initialOptions: [makeOption()] });

    expect(screen.getByTestId("option-list")).toBeDefined();
  });

  it("renders EmptyPickView when no options", () => {
    renderView({ initialOptions: [] });

    expect(screen.getByText(EMPTY_PICK_COPY.headline)).toBeDefined();
  });

  it("renders OptionList (not EmptyPickView) when suggestions exist and options are empty", () => {
    renderView({
      initialOptions: [],
      initialSuggestions: [makeOption({ id: "suggest-1", title: "Suggested" })],
    });

    expect(screen.getByTestId("option-list")).toBeDefined();
    expect(screen.queryByText(EMPTY_PICK_COPY.headline)).toBeNull();
  });

  it("opens the suggest sheet when the empty-state CTA is clicked", () => {
    renderView({ initialOptions: [] });

    fireEvent.click(
      screen.getByRole("button", { name: EMPTY_PICK_COPY.ctaButton }),
    );

    expect(screen.getByTestId("suggest-option-sheet")).toBeDefined();
  });

  it("does not render the empty-state CTA when the pick is closed", () => {
    renderView({
      initialOptions: [],
      pick: makePick({ closedAt: new Date("2025-06-01T00:00:00.000Z") }),
    });

    expect(
      screen.queryByRole("button", { name: EMPTY_PICK_COPY.ctaButton }),
    ).toBeNull();
  });
});

describe("suggest option sheet wiring", () => {
  it("adds the new option to the list when onOptionAdded fires (empty initial state)", () => {
    renderView({ initialOptions: [] });

    fireEvent.click(
      screen.getByRole("button", {
        name: PICK_DETAIL_SCAFFOLD_COPY.suggestOptionButton,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "mock-add-option" }));

    expect(screen.getByTestId("option-list")).toBeDefined();
    expect(screen.queryByText(EMPTY_PICK_COPY.headline)).toBeNull();
  });

  it("adds the new option to the ranking tab when onOptionAdded fires (non-empty initial state)", () => {
    const existing = makeOption({
      id: "opt-existing",
      title: "Existing Option",
      ownerIds: ["user-1"],
    });

    renderView({ initialOptions: [existing], currentUserId: "user-1" });

    fireEvent.click(
      screen.getByRole("button", {
        name: PICK_DETAIL_SCAFFOLD_COPY.suggestOptionButton,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "mock-add-option" }));

    fireEvent.click(
      screen.getByRole("tab", { name: PICK_DETAIL_SCAFFOLD_COPY.tabs.ranking }),
    );

    expect(screen.getByText("New Option")).toBeDefined();
  });

  it("merges ownership when onOptionAdded fires with an existing option id", () => {
    const existing = makeOption({
      id: "opt-existing",
      title: "Existing Option",
      ownerIds: ["user-1"],
    });

    mockSuggestedOption = makeSuggestedOptionPayload({
      optionId: "opt-existing",
      title: "Existing Option",
    });

    renderView({ initialOptions: [existing], currentUserId: "user-2" });

    fireEvent.click(
      screen.getByRole("button", {
        name: PICK_DETAIL_SCAFFOLD_COPY.suggestOptionButton,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "mock-add-option" }));

    fireEvent.click(
      screen.getByRole("tab", { name: PICK_DETAIL_SCAFFOLD_COPY.tabs.ranking }),
    );

    expect(screen.getByText("Existing Option")).toBeDefined();
  });
});

describe("ranking tab owner filtering", () => {
  it("shows only the current user's options in the ranking tab", () => {
    const ownedOption = makeOption({
      id: "opt-owned",
      title: "My Option",
      ownerIds: ["user-1"],
    });
    const otherOption = makeOption({
      id: "opt-other",
      title: "Other Option",
      ownerIds: ["user-2"],
    });

    renderView({
      currentUserId: "user-1",
      initialOptions: [ownedOption, otherOption],
    });

    fireEvent.click(
      screen.getByRole("tab", { name: PICK_DETAIL_SCAFFOLD_COPY.tabs.ranking }),
    );

    expect(screen.getByText("My Option")).toBeDefined();
    expect(screen.queryByText("Other Option")).toBeNull();
  });
});

describe("pick metadata — category name", () => {
  it("renders the category name when provided", () => {
    renderView({ categoryName: "Best Movies" });

    expect(screen.getByText("Best Movies")).toBeDefined();
  });

  it("does not render the category label when category name is not provided", () => {
    renderView({ categoryName: undefined });

    expect(
      screen.queryByText(PICK_DETAIL_SCAFFOLD_COPY.categoryLabel),
    ).toBeNull();
  });
});

describe("pick metadata — due date", () => {
  it("renders the formatted due date when pick.dueDate is set", () => {
    const dueDate = new Date("2026-06-01T00:00:00.000Z");
    renderView({ pick: makePick({ dueDate }) });

    expect(screen.getByText(dueDate.toLocaleDateString())).toBeDefined();
  });

  it("does not render due date when pick.dueDate is absent", () => {
    renderView({ pick: makePick({ dueDate: undefined }) });

    expect(
      screen.queryByText(PICK_DETAIL_SCAFFOLD_COPY.dueDateLabel),
    ).toBeNull();
  });
});

describe("participant count", () => {
  it("renders the participants label", () => {
    renderView({ initialOptions: [makeOption({ ownerIds: ["user-1"] })] });

    expect(
      screen.getByText(PICK_DETAIL_SCAFFOLD_COPY.participantsLabel),
    ).toBeDefined();
  });

  it("counts unique owners across all options", () => {
    renderView({
      pick: makePick({ topCount: 99 }),
      initialOptions: [
        makeOption({ id: "opt-1", ownerIds: ["user-1", "user-2"] }),
        makeOption({ id: "opt-2", ownerIds: ["user-2", "user-3"] }),
      ],
    });

    expect(screen.getByText("3")).toBeDefined();
  });
});

describe("top picks results", () => {
  it("renders option titles in the top picks tab when pick is closed", () => {
    const option1 = makeOption({ id: "opt-1", title: "Option Alpha" });
    const option2 = makeOption({ id: "opt-2", title: "Option Beta" });

    renderView({
      pick: makePick({
        closedAt: new Date("2025-06-01T00:00:00.000Z"),
        topCount: 2,
      }),
      topPicks: [option1, option2],
    });

    expect(screen.getByText("Option Alpha")).toBeDefined();
    expect(screen.getByText("Option Beta")).toBeDefined();
  });

  it("renders only the provided topPicks in the top picks tab", () => {
    const topOption = makeOption({ id: "opt-1", title: "Top Option" });
    const excludedOption = makeOption({
      id: "opt-2",
      title: "Excluded Option",
    });

    renderView({
      pick: makePick({
        closedAt: new Date("2025-06-01T00:00:00.000Z"),
        topCount: 1,
      }),
      topPicks: [topOption, excludedOption],
    });

    expect(screen.getByText("Top Option")).toBeDefined();
    expect(screen.queryByText("Excluded Option")).toBeNull();
  });

  it("shows the results placeholder when closed pick has no top picks", () => {
    renderView({
      pick: makePick({ closedAt: new Date("2025-06-01T00:00:00.000Z") }),
      topPicks: [],
    });

    expect(
      screen.getByText(TOP_PICKS_VIEW_COPY.noResultsMessage),
    ).toBeDefined();
  });
});
