import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { GroupPick } from "@/lib/types/pick";
import { PickDetailView } from "./PickDetailView";
import { PICK_DETAIL_SCAFFOLD_COPY } from "./copy";

afterEach(cleanup);

vi.mock("@/app/categories/[id]/picks/[pickId]/OptionList", () => ({
  OptionList: () => <div data-testid="option-list" />,
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

  it("renders OptionList in the Options tab panel", () => {
    renderView();

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

describe("closed state: suggest option hidden", () => {
  it("hides the suggest option button when pick is closed", () => {
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

describe("closed state: reopen button for creator only", () => {
  it("shows reopen button for the pick creator", () => {
    renderView({
      pick: makePick({
        closedAt: new Date("2025-06-01T00:00:00.000Z"),
        creatorId: "user-1",
      }),
      currentUserId: "user-1",
    });

    expect(
      screen.getByRole("button", {
        name: PICK_DETAIL_SCAFFOLD_COPY.reopenButton,
      }),
    ).toBeDefined();
  });

  it("hides reopen button for non-creator members", () => {
    renderView({
      pick: makePick({
        closedAt: new Date("2025-06-01T00:00:00.000Z"),
        creatorId: "user-1",
      }),
      currentUserId: "user-2",
    });

    expect(
      screen.queryByRole("button", {
        name: PICK_DETAIL_SCAFFOLD_COPY.reopenButton,
      }),
    ).toBeNull();
  });
});
