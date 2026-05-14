import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Option } from "@/lib/types/option";
import type { GroupPick } from "@/lib/types/pick";

import { EMPTY_PICK_COPY } from "./EmptyPickView.copy";
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

function makeOption(overrides?: Partial<Option>): Option {
  return {
    id: "opt-1",
    title: "Option title",
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

  it("renders the open status chip when pick is not closed", () => {
    renderView({ pick: makePick({ closedAt: undefined }) });

    expect(
      screen.getByText(PICK_DETAIL_SCAFFOLD_COPY.openStatusChip),
    ).toBeDefined();
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

describe('"+ Suggest option" button', () => {
  it("renders the suggest option button", () => {
    renderView();

    expect(
      screen.getByRole("button", {
        name: PICK_DETAIL_SCAFFOLD_COPY.suggestOptionButton,
      }),
    ).toBeDefined();
  });
});

describe("empty state when no options", () => {
  it("shows the empty-state headline when initialOptions is empty", () => {
    renderView({ initialOptions: [] });

    expect(screen.getByText(EMPTY_PICK_COPY.headline)).toBeDefined();
  });

  it("shows the empty-state body copy when initialOptions is empty", () => {
    renderView({ initialOptions: [] });

    expect(screen.getByText(EMPTY_PICK_COPY.body)).toBeDefined();
  });

  it("shows the suggest-first-option CTA when initialOptions is empty", () => {
    renderView({ initialOptions: [] });

    expect(
      screen.getByRole("button", { name: EMPTY_PICK_COPY.ctaButton }),
    ).toBeDefined();
  });

  it("does not show OptionList when initialOptions is empty", () => {
    renderView({ initialOptions: [] });

    expect(screen.queryByTestId("option-list")).toBeNull();
  });

  it("does not show the empty state when initialOptions is non-empty", () => {
    renderView({ initialOptions: [makeOption()] });

    expect(screen.queryByText(EMPTY_PICK_COPY.headline)).toBeNull();
  });
});
