import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// TODO: upgrade to userEvent when @testing-library/user-event is available
import { makeSnapPickOption } from "@/lib/fixtures/snap-pick";

import { SNAP_PICK_OPTION_LIST_COPY } from "./SnapPickOptionList.copy";
import { SnapPickOptionListView } from "./SnapPickOptionListView";

afterEach(cleanup);

const noop = () => undefined;

function renderView(
  overrides?: Partial<React.ComponentProps<typeof SnapPickOptionListView>>,
) {
  return render(
    <SnapPickOptionListView
      options={[]}
      currentUserId="user-1"
      newTitle=""
      loading={false}
      error={undefined}
      onNewTitleChange={noop}
      onAddSubmit={noop}
      onRemove={noop}
      {...overrides}
    />,
  );
}

describe("Members can add a new option to the pool", () => {
  it("submits the add form", () => {
    const onAddSubmit = vi.fn((e: React.SyntheticEvent) => {
      e.preventDefault();
    });
    renderView({ newTitle: "Pizza", onAddSubmit });

    fireEvent.click(
      screen.getByRole("button", {
        name: SNAP_PICK_OPTION_LIST_COPY.addOptionButton,
      }),
    );

    expect(onAddSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows the empty-pool message when there are no options", () => {
    renderView({ options: [] });

    expect(
      screen.getByText(SNAP_PICK_OPTION_LIST_COPY.noOptionsMessage),
    ).toBeDefined();
  });
});

describe("Members can remove an option they own", () => {
  it("shows a remove control for an option the current user added", () => {
    renderView({
      options: [makeSnapPickOption({ title: "Pizza", addedBy: "user-1" })],
    });

    expect(
      screen.getByRole("button", {
        name: `${SNAP_PICK_OPTION_LIST_COPY.removeOptionLabel}: Pizza`,
      }),
    ).toBeDefined();
  });

  it("hides the remove control for an option another user added", () => {
    renderView({
      options: [makeSnapPickOption({ title: "Tacos", addedBy: "user-2" })],
    });

    expect(
      screen.queryByRole("button", {
        name: `${SNAP_PICK_OPTION_LIST_COPY.removeOptionLabel}: Tacos`,
      }),
    ).toBeNull();
  });

  it("calls onRemove with the option when the remove control is clicked", () => {
    const option = makeSnapPickOption({ title: "Pizza", addedBy: "user-1" });
    const onRemove = vi.fn();
    renderView({ options: [option], onRemove });

    fireEvent.click(
      screen.getByRole("button", {
        name: `${SNAP_PICK_OPTION_LIST_COPY.removeOptionLabel}: Pizza`,
      }),
    );

    expect(onRemove).toHaveBeenCalledWith(option);
  });
});
