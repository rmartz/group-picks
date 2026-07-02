import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ACTIVE_SNAP_PICK_LIST_COPY } from "./ActiveSnapPickList.copy";
import {
  type ActiveSnapPickListItem,
  ActiveSnapPickListView,
} from "./ActiveSnapPickListView";

afterEach(cleanup);

const item: ActiveSnapPickListItem = {
  activationId: "activation-1",
  title: "Where should we eat tonight?",
  categoryName: "Dinner",
  timeRemainingLabel: "Closes in 2h 15m",
  href: "/groups/group-1/categories/cat-1/snap-picks/snap-1",
};

describe("ActiveSnapPickListView", () => {
  it("renders the section heading", () => {
    render(<ActiveSnapPickListView items={[item]} />);

    expect(screen.getByText(ACTIVE_SNAP_PICK_LIST_COPY.heading)).toBeDefined();
  });

  it("renders a Vote now link to the snap pick detail route", () => {
    render(<ActiveSnapPickListView items={[item]} />);

    expect(
      screen
        .getByRole("link", { name: ACTIVE_SNAP_PICK_LIST_COPY.voteNowButton })
        .getAttribute("href"),
    ).toBe("/groups/group-1/categories/cat-1/snap-picks/snap-1");
  });

  it("shows the category name alongside the time remaining", () => {
    render(<ActiveSnapPickListView items={[item]} />);

    expect(screen.getByText("Dinner · Closes in 2h 15m")).toBeDefined();
  });

  it("shows only the time remaining when there is no category name", () => {
    render(
      <ActiveSnapPickListView items={[{ ...item, categoryName: undefined }]} />,
    );

    expect(screen.getByText("Closes in 2h 15m")).toBeDefined();
  });
});
