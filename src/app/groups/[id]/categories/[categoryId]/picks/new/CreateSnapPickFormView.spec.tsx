import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CREATE_SNAP_PICK_COPY } from "./CreateSnapPickForm.copy";
import { CreateSnapPickFormView } from "./CreateSnapPickFormView";

afterEach(cleanup);

const noop = vi.fn();

describe("CreateSnapPickFormView", () => {
  it("renders the Snap Pick create heading", () => {
    render(
      <CreateSnapPickFormView
        title=""
        onTitleChange={noop}
        onSubmit={noop}
        onCancel={noop}
        loading={false}
        error={undefined}
      />,
    );

    expect(screen.getByText(CREATE_SNAP_PICK_COPY.title)).toBeDefined();
  });

  it("disables the submit button when the title is blank", () => {
    render(
      <CreateSnapPickFormView
        title=""
        onTitleChange={noop}
        onSubmit={noop}
        onCancel={noop}
        loading={false}
        error={undefined}
      />,
    );

    expect(
      screen
        .getByRole("button", { name: CREATE_SNAP_PICK_COPY.submitButton })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  // TODO: upgrade to userEvent when @testing-library/user-event is available
  it("invokes onSubmit when the form is submitted", () => {
    const onSubmit = vi.fn((e: React.SyntheticEvent) => {
      e.preventDefault();
    });
    const { container } = render(
      <CreateSnapPickFormView
        title="Dinner"
        onTitleChange={noop}
        onSubmit={onSubmit}
        onCancel={noop}
        loading={false}
        error={undefined}
      />,
    );

    const form = container.querySelector("form");
    if (form) fireEvent.submit(form);

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("shows the error message when provided", () => {
    render(
      <CreateSnapPickFormView
        title="Dinner"
        onTitleChange={noop}
        onSubmit={noop}
        onCancel={noop}
        loading={false}
        error={CREATE_SNAP_PICK_COPY.errors.default}
      />,
    );

    expect(
      screen.getByText(CREATE_SNAP_PICK_COPY.errors.default),
    ).toBeDefined();
  });
});
