import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CATEGORY_COPY } from "./copy";
import { EditCategoryFormView } from "./EditCategoryFormView";

afterEach(cleanup);

describe("EditCategoryFormView", () => {
  it("renders name and description fields", () => {
    render(
      <EditCategoryFormView
        name="Best Movies"
        description="Vote on movies"
        onNameChange={() => undefined}
        onDescriptionChange={() => undefined}
        onSubmit={() => undefined}
        onCancel={() => undefined}
        loading={false}
        error={undefined}
      />,
    );

    expect(
      screen.getByLabelText(CATEGORY_COPY.editForm.nameLabel),
    ).toBeDefined();
    expect(
      screen.getByLabelText(CATEGORY_COPY.editForm.descriptionLabel),
    ).toBeDefined();
  });

  it("shows current name and description values", () => {
    render(
      <EditCategoryFormView
        name="Best Movies"
        description="Vote on movies"
        onNameChange={() => undefined}
        onDescriptionChange={() => undefined}
        onSubmit={() => undefined}
        onCancel={() => undefined}
        loading={false}
        error={undefined}
      />,
    );

    const nameInput = screen.getByLabelText(CATEGORY_COPY.editForm.nameLabel);
    const descInput = screen.getByLabelText(
      CATEGORY_COPY.editForm.descriptionLabel,
    );

    expect((nameInput as HTMLInputElement).value).toBe("Best Movies");
    expect((descInput as HTMLInputElement).value).toBe("Vote on movies");
  });

  it("renders save and cancel buttons", () => {
    render(
      <EditCategoryFormView
        name="Best Movies"
        description=""
        onNameChange={() => undefined}
        onDescriptionChange={() => undefined}
        onSubmit={() => undefined}
        onCancel={() => undefined}
        loading={false}
        error={undefined}
      />,
    );

    expect(screen.getByText(CATEGORY_COPY.editForm.submitButton)).toBeDefined();
    expect(screen.getByText(CATEGORY_COPY.editForm.cancelButton)).toBeDefined();
  });

  it("calls onCancel when cancel button is clicked", () => {
    let cancelled = false;

    render(
      <EditCategoryFormView
        name="Best Movies"
        description=""
        onNameChange={() => undefined}
        onDescriptionChange={() => undefined}
        onSubmit={() => undefined}
        onCancel={() => {
          cancelled = true;
        }}
        loading={false}
        error={undefined}
      />,
    );

    fireEvent.click(screen.getByText(CATEGORY_COPY.editForm.cancelButton));
    expect(cancelled).toBe(true);
  });

  it("renders error message when error is provided", () => {
    const errorMsg = "Something went wrong";
    render(
      <EditCategoryFormView
        name="Best Movies"
        description=""
        onNameChange={() => undefined}
        onDescriptionChange={() => undefined}
        onSubmit={() => undefined}
        onCancel={() => undefined}
        loading={false}
        error={errorMsg}
      />,
    );

    expect(screen.getByText(errorMsg)).toBeDefined();
  });

  it("disables buttons when loading", () => {
    render(
      <EditCategoryFormView
        name="Best Movies"
        description=""
        onNameChange={() => undefined}
        onDescriptionChange={() => undefined}
        onSubmit={() => undefined}
        onCancel={() => undefined}
        loading={true}
        error={undefined}
      />,
    );

    const submitBtn = screen.getByText(CATEGORY_COPY.editForm.submitButton);
    const cancelBtn = screen.getByText(CATEGORY_COPY.editForm.cancelButton);

    expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
    expect((cancelBtn as HTMLButtonElement).disabled).toBe(true);
  });
});
