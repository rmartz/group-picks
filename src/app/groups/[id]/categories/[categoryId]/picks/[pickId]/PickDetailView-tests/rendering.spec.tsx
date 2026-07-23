import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BREADCRUMBS_COPY } from "@/components/breadcrumbs";

import { PICK_DETAIL_SCAFFOLD_COPY } from "../copy";
import { PickDetailView } from "../PickDetailView";
import { makeOption, makePick } from "./helpers";

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

describe("breadcrumb trail", () => {
  it("renders a Group → Category → Pick breadcrumb trail", () => {
    renderView({
      pick: makePick({ id: "pick-1", title: "Best Movie of 2025" }),
      groupName: "Movie Night",
      categoryName: "Best Movies",
    });

    const nav = screen.getByRole("navigation", {
      name: BREADCRUMBS_COPY.navLabel,
    });

    const groupCrumb = within(nav).getByRole("link", { name: "Movie Night" });
    expect(groupCrumb.getAttribute("href")).toBe("/groups/group-1");

    const categoryCrumb = within(nav).getByRole("link", {
      name: "Best Movies",
    });
    expect(categoryCrumb.getAttribute("href")).toBe(
      "/groups/group-1/categories/cat-1",
    );

    const pickCrumb = within(nav).getByText("Best Movie of 2025");
    expect(pickCrumb.getAttribute("aria-current")).toBe("page");
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
