import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Option } from "@/lib/types/option";
import type { GroupPick } from "@/lib/types/pick";

import { PICK_DETAIL_SCAFFOLD_COPY } from "./copy";
import { PickDetailView } from "./PickDetailView";

let capturedOnOptionsChange: ((options: Option[]) => void) | undefined;

afterEach(() => {
  cleanup();
  capturedOnOptionsChange = undefined;
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

vi.mock("../../ReopenPickButton", () => ({
  ReopenPickButton: () => (
    <button>{PICK_DETAIL_SCAFFOLD_COPY.reopenButton}</button>
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

  it("renders top picks tab as locked placeholder when open", () => {
    renderView({ pick: makePick({ closedAt: undefined }) });

    expect(
      screen.getByText(PICK_DETAIL_SCAFFOLD_COPY.topPicksLockedPlaceholder),
    ).toBeDefined();
  });

  it("does not render the reopen button when open", () => {
    renderView({ pick: makePick({ closedAt: undefined }) });

    expect(
      screen.queryByRole("button", {
        name: PICK_DETAIL_SCAFFOLD_COPY.reopenButton,
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
      screen.getByText(PICK_DETAIL_SCAFFOLD_COPY.resultsPlaceholder),
    ).toBeDefined();
    expect(
      screen.queryByText(PICK_DETAIL_SCAFFOLD_COPY.topPicksLockedPlaceholder),
    ).toBeNull();
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
        name: PICK_DETAIL_SCAFFOLD_COPY.reopenButton,
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
        name: PICK_DETAIL_SCAFFOLD_COPY.reopenButton,
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
  it("renders OptionList regardless of option count", () => {
    renderView({ initialOptions: [] });

    expect(screen.getByTestId("option-list")).toBeDefined();
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
