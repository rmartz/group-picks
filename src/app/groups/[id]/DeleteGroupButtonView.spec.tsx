import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DeleteGroupButtonView } from "./DeleteGroupButtonView";
import { DELETE_GROUP_COPY } from "./DeleteGroupButtonView.copy";

afterEach(cleanup);

const GROUP_NAME = "Friday Night Picks";

function renderView(
  overrides?: Partial<Parameters<typeof DeleteGroupButtonView>[0]>,
) {
  return render(
    <DeleteGroupButtonView
      groupName={GROUP_NAME}
      onDelete={vi.fn()}
      isDeleting={false}
      error={undefined}
      {...overrides}
    />,
  );
}

describe("DeleteGroupButtonView — initial state", () => {
  it("renders the delete group button", () => {
    renderView();
    expect(
      screen.getByRole("button", { name: DELETE_GROUP_COPY.deleteButton }),
    ).toBeDefined();
  });

  it("does not show the confirmation dialog initially", () => {
    renderView();
    expect(screen.queryByTestId("delete-group-confirm")).toBeNull();
  });
});

describe("DeleteGroupButtonView — confirmation dialog", () => {
  it("shows the confirmation dialog when Delete Group is clicked", () => {
    renderView();
    fireEvent.click(
      screen.getByRole("button", { name: DELETE_GROUP_COPY.deleteButton }),
    );
    expect(screen.getByTestId("delete-group-confirm")).toBeDefined();
  });

  it("shows the group name prompt in the confirmation dialog", () => {
    renderView();
    fireEvent.click(
      screen.getByRole("button", { name: DELETE_GROUP_COPY.deleteButton }),
    );
    expect(
      screen.getByText(DELETE_GROUP_COPY.confirmPrompt(GROUP_NAME)),
    ).toBeDefined();
  });

  it("renders the confirmation input", () => {
    renderView();
    fireEvent.click(
      screen.getByRole("button", { name: DELETE_GROUP_COPY.deleteButton }),
    );
    expect(
      screen.getByPlaceholderText(DELETE_GROUP_COPY.confirmPlaceholder),
    ).toBeDefined();
  });

  it("confirm button is disabled when input is empty", () => {
    renderView();
    fireEvent.click(
      screen.getByRole("button", { name: DELETE_GROUP_COPY.deleteButton }),
    );
    const confirmBtn = screen.getByRole("button", {
      name: DELETE_GROUP_COPY.confirmDeleteButton,
    });
    expect(confirmBtn.getAttribute("disabled")).not.toBeNull();
  });

  it("confirm button is disabled when input does not match the group name", () => {
    renderView();
    fireEvent.click(
      screen.getByRole("button", { name: DELETE_GROUP_COPY.deleteButton }),
    );
    const input = screen.getByPlaceholderText(
      DELETE_GROUP_COPY.confirmPlaceholder,
    );
    fireEvent.change(input, { target: { value: "wrong name" } });
    const confirmBtn = screen.getByRole("button", {
      name: DELETE_GROUP_COPY.confirmDeleteButton,
    });
    expect(confirmBtn.getAttribute("disabled")).not.toBeNull();
  });

  it("confirm button is enabled when input exactly matches the group name", () => {
    renderView();
    fireEvent.click(
      screen.getByRole("button", { name: DELETE_GROUP_COPY.deleteButton }),
    );
    const input = screen.getByPlaceholderText(
      DELETE_GROUP_COPY.confirmPlaceholder,
    );
    fireEvent.change(input, { target: { value: GROUP_NAME } });
    const confirmBtn = screen.getByRole("button", {
      name: DELETE_GROUP_COPY.confirmDeleteButton,
    });
    expect(confirmBtn.getAttribute("disabled")).toBeNull();
  });

  it("calls onDelete when confirmation is submitted with correct group name", () => {
    const onDelete = vi.fn();
    renderView({ onDelete });
    fireEvent.click(
      screen.getByRole("button", { name: DELETE_GROUP_COPY.deleteButton }),
    );
    const input = screen.getByPlaceholderText(
      DELETE_GROUP_COPY.confirmPlaceholder,
    );
    fireEvent.change(input, { target: { value: GROUP_NAME } });
    fireEvent.click(
      screen.getByRole("button", {
        name: DELETE_GROUP_COPY.confirmDeleteButton,
      }),
    );
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("does not call onDelete when confirmation input does not match", () => {
    const onDelete = vi.fn();
    renderView({ onDelete });
    fireEvent.click(
      screen.getByRole("button", { name: DELETE_GROUP_COPY.deleteButton }),
    );
    const input = screen.getByPlaceholderText(
      DELETE_GROUP_COPY.confirmPlaceholder,
    );
    fireEvent.change(input, { target: { value: "wrong name" } });
    // Confirm button is disabled, so click won't fire onDelete
    const confirmBtn = screen.getByRole("button", {
      name: DELETE_GROUP_COPY.confirmDeleteButton,
    });
    fireEvent.click(confirmBtn);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("hides the confirmation dialog when Cancel is clicked", () => {
    renderView();
    fireEvent.click(
      screen.getByRole("button", { name: DELETE_GROUP_COPY.deleteButton }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: DELETE_GROUP_COPY.cancelButton }),
    );
    expect(screen.queryByTestId("delete-group-confirm")).toBeNull();
  });
});

describe("DeleteGroupButtonView — deleting state", () => {
  it("disables the delete button while deleting", () => {
    renderView({ isDeleting: true });
    const btn = screen.getByRole("button", {
      name: DELETE_GROUP_COPY.deletingButton,
    });
    expect(btn.getAttribute("disabled")).not.toBeNull();
  });
});

describe("DeleteGroupButtonView — error state", () => {
  it("renders the error message when provided", () => {
    renderView({ error: DELETE_GROUP_COPY.error });
    expect(screen.getByText(DELETE_GROUP_COPY.error)).toBeDefined();
  });

  it("does not render an error message when error is undefined", () => {
    renderView({ error: undefined });
    expect(screen.queryByText(DELETE_GROUP_COPY.error)).toBeNull();
  });
});
