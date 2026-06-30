import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { makeSnapPick } from "@/lib/fixtures/snap-pick";

import { SNAP_PICK_SECTION_COPY } from "./SnapPickSection.copy";
import { SnapPickSectionView } from "./SnapPickSectionView";

afterEach(cleanup);

const noop = vi.fn();

describe("lists Snap Picks linking to their detail pages", () => {
  it("renders a link per snap pick to its detail route", () => {
    render(
      <SnapPickSectionView
        categoryId="cat-1"
        error={undefined}
        groupId="group-1"
        loading={false}
        onSubmit={noop}
        onTitleChange={noop}
        snapPicks={[
          makeSnapPick({ id: "snap-a", title: "Lunch" }),
          makeSnapPick({ id: "snap-b", title: "Movie" }),
        ]}
        title=""
      />,
    );

    expect(
      screen.getByRole("link", { name: "Lunch" }).getAttribute("href"),
    ).toBe("/groups/group-1/categories/cat-1/snap-picks/snap-a");
    expect(
      screen.getByRole("link", { name: "Movie" }).getAttribute("href"),
    ).toBe("/groups/group-1/categories/cat-1/snap-picks/snap-b");
  });

  it("shows the empty message when there are no snap picks", () => {
    render(
      <SnapPickSectionView
        categoryId="cat-1"
        error={undefined}
        groupId="group-1"
        loading={false}
        onSubmit={noop}
        onTitleChange={noop}
        snapPicks={[]}
        title=""
      />,
    );

    expect(screen.getByText(SNAP_PICK_SECTION_COPY.empty)).toBeDefined();
  });
});

describe("provides a create entry point", () => {
  // TODO: upgrade to userEvent when @testing-library/user-event is available
  it("submits the create form, invoking onSubmit", () => {
    const onSubmit = vi.fn((e: React.SyntheticEvent) => {
      e.preventDefault();
    });
    const { container } = render(
      <SnapPickSectionView
        categoryId="cat-1"
        error={undefined}
        groupId="group-1"
        loading={false}
        onSubmit={onSubmit}
        onTitleChange={noop}
        snapPicks={[]}
        title="Dinner"
      />,
    );

    const form = container.querySelector("form");
    expect(form).toBeDefined();
    if (form) fireEvent.submit(form);

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("disables the create button when the title is blank", () => {
    render(
      <SnapPickSectionView
        categoryId="cat-1"
        error={undefined}
        groupId="group-1"
        loading={false}
        onSubmit={noop}
        onTitleChange={noop}
        snapPicks={[]}
        title=""
      />,
    );

    expect(
      screen
        .getByRole("button", { name: SNAP_PICK_SECTION_COPY.createButton })
        .hasAttribute("disabled"),
    ).toBe(true);
  });
});
