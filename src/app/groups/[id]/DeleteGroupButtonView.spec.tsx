import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GROUP_DETAIL_COPY } from "./copy";
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
      screen.getByLabelText(DELETE_GROUP_COPY.confirmPrompt(GROUP_NAME)),
    ).toBeDefined();
  });

  it("wires the prompt paragraph to the input via aria-describedby", () => {
    renderView();
    fireEvent.click(
      screen.getByRole("button", { name: DELETE_GROUP_COPY.deleteButton }),
    );
    const input = screen.getByLabelText(
      DELETE_GROUP_COPY.confirmPrompt(GROUP_NAME),
    );
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeDefined();
    const prompt = screen.getByText(
      DELETE_GROUP_COPY.confirmPrompt(GROUP_NAME),
    );
    expect(prompt.getAttribute("id")).toBe(describedBy);
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

  it("disables the input, confirm, and cancel controls while deleting", () => {
    const view = renderView();
    fireEvent.click(
      screen.getByRole("button", { name: DELETE_GROUP_COPY.deleteButton }),
    );
    view.rerender(
      <DeleteGroupButtonView
        groupName={GROUP_NAME}
        onDelete={vi.fn()}
        isDeleting
        error={undefined}
      />,
    );
    const input = screen.getByLabelText(
      DELETE_GROUP_COPY.confirmPrompt(GROUP_NAME),
    );
    const confirmButton = screen.getByRole("button", {
      name: DELETE_GROUP_COPY.deletingButton,
    });
    const cancelButton = screen.getByRole("button", {
      name: DELETE_GROUP_COPY.cancelButton,
    });
    expect(input.getAttribute("disabled")).not.toBeNull();
    expect(confirmButton.getAttribute("disabled")).not.toBeNull();
    expect(cancelButton.getAttribute("disabled")).not.toBeNull();
  });

  it("keeps confirm disabled while deleting even when input matches", () => {
    const view = renderView();
    fireEvent.click(
      screen.getByRole("button", { name: DELETE_GROUP_COPY.deleteButton }),
    );
    view.rerender(
      <DeleteGroupButtonView
        groupName={GROUP_NAME}
        onDelete={vi.fn()}
        isDeleting
        error={undefined}
      />,
    );
    const input = screen.getByLabelText(
      DELETE_GROUP_COPY.confirmPrompt(GROUP_NAME),
    );
    fireEvent.change(input, { target: { value: GROUP_NAME } });
    const confirmButton = screen.getByRole("button", {
      name: DELETE_GROUP_COPY.deletingButton,
    });
    expect(confirmButton.getAttribute("disabled")).not.toBeNull();
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
    renderView({ error: GROUP_DETAIL_COPY.deleteGroupError });
    expect(screen.getByText(GROUP_DETAIL_COPY.deleteGroupError)).toBeDefined();
  });

  it("does not render an error message when error is undefined", () => {
    renderView({ error: undefined });
    expect(screen.queryByText(GROUP_DETAIL_COPY.deleteGroupError)).toBeNull();
  });
});
