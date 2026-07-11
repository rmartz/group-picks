import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BREADCRUMBS_COPY } from "@/components/breadcrumbs";
import {
  makeSnapPick,
  makeSnapPickActivation,
  makeSnapPickHistoryEntry,
} from "@/lib/fixtures/snap-pick";

import { SnapPickDetailView } from "./SnapPickDetailView";
import { SNAP_PICK_DETAIL_COPY } from "./SnapPickDetailView.copy";

// The activation panel calls useRouter; stub it so the detail shell renders.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => undefined }),
}));

afterEach(cleanup);

describe("renders the Snap Pick detail shell", () => {
  it("shows the snap pick title as the heading", () => {
    render(
      <SnapPickDetailView
        snapPick={makeSnapPick({ title: "Friday Lunch" })}
        groupId="group-1"
        groupName="Team"
        categoryName="Meals"
        currentUserId="user-1"
        options={[]}
        votedPairKeys={[]}
        historyEntries={[]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Friday Lunch", level: 1 }),
    ).toBeDefined();
  });

  it("renders slots for the option pool, activation, and voting sections", () => {
    render(
      <SnapPickDetailView
        snapPick={makeSnapPick()}
        groupId="group-1"
        groupName="Team"
        categoryName="Meals"
        currentUserId="user-1"
        options={[]}
        votedPairKeys={[]}
        historyEntries={[]}
      />,
    );

    expect(
      screen.getByText(SNAP_PICK_DETAIL_COPY.optionPoolHeading),
    ).toBeDefined();
    expect(
      screen.getByText(SNAP_PICK_DETAIL_COPY.activationHeading),
    ).toBeDefined();
    expect(screen.getByText(SNAP_PICK_DETAIL_COPY.votingHeading)).toBeDefined();
    expect(
      screen.getByText(SNAP_PICK_DETAIL_COPY.historyHeading),
    ).toBeDefined();
  });

  it("renders the history timeline of past activations", () => {
    render(
      <SnapPickDetailView
        snapPick={makeSnapPick()}
        groupId="group-1"
        groupName="Team"
        categoryName="Meals"
        currentUserId="user-1"
        options={[]}
        votedPairKeys={[]}
        historyEntries={[
          makeSnapPickHistoryEntry({
            activationId: "act-past",
            winnerTitle: "Ramen",
          }),
        ]}
      />,
    );

    expect(screen.getByText("Ramen")).toBeDefined();
  });

  it("locks the option pool while an activation is in progress", () => {
    render(
      <SnapPickDetailView
        snapPick={makeSnapPick()}
        groupId="group-1"
        groupName="Team"
        categoryName="Meals"
        currentUserId="user-1"
        options={[]}
        activation={makeSnapPickActivation({ closedAt: undefined })}
        votedPairKeys={[]}
        historyEntries={[]}
      />,
    );

    expect(
      screen.getByText(SNAP_PICK_DETAIL_COPY.optionPoolActivationNotice),
    ).toBeDefined();
  });
});

describe("breadcrumb trail", () => {
  it("renders a Group → Category → Snap Pick breadcrumb trail", () => {
    render(
      <SnapPickDetailView
        snapPick={makeSnapPick({
          id: "snap-1",
          categoryId: "cat-1",
          title: "Friday Lunch",
        })}
        groupId="group-1"
        groupName="Team"
        categoryName="Meals"
        currentUserId="user-1"
        options={[]}
        votedPairKeys={[]}
        historyEntries={[]}
      />,
    );

    const nav = screen.getByRole("navigation", {
      name: BREADCRUMBS_COPY.navLabel,
    });

    const groupCrumb = within(nav).getByRole("link", { name: "Team" });
    expect(groupCrumb.getAttribute("href")).toBe("/groups/group-1");

    const categoryCrumb = within(nav).getByRole("link", { name: "Meals" });
    expect(categoryCrumb.getAttribute("href")).toBe(
      "/groups/group-1/categories/cat-1",
    );

    const snapPickCrumb = within(nav).getByText("Friday Lunch");
    expect(snapPickCrumb.getAttribute("aria-current")).toBe("page");
    expect(snapPickCrumb.getAttribute("href")).toBeNull();
  });

  it("omits the category crumb when no category name is supplied", () => {
    render(
      <SnapPickDetailView
        snapPick={makeSnapPick({ categoryId: "cat-1", title: "Friday Lunch" })}
        groupId="group-1"
        groupName="Team"
        currentUserId="user-1"
        options={[]}
        votedPairKeys={[]}
        historyEntries={[]}
      />,
    );

    const nav = screen.getByRole("navigation", {
      name: BREADCRUMBS_COPY.navLabel,
    });

    expect(within(nav).getByRole("link", { name: "Team" })).toBeDefined();
    expect(within(nav).queryByText("Meals")).toBeNull();
  });
});
