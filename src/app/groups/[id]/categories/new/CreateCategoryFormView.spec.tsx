import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CREATE_CATEGORY_COPY } from "./copy";
import { CreateCategoryFormView } from "./CreateCategoryFormView";

afterEach(cleanup);

describe("CreateCategoryFormView", () => {
  it("renders the title and form fields", () => {
    render(
      <CreateCategoryFormView
        name=""
        onNameChange={vi.fn()}
        description=""
        onDescriptionChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={false}
        error={undefined}
      />,
    );

    expect(screen.getByText(CREATE_CATEGORY_COPY.title)).toBeDefined();
    expect(screen.getByLabelText(CREATE_CATEGORY_COPY.nameLabel)).toBeDefined();
    expect(
      screen.getByLabelText(CREATE_CATEGORY_COPY.descriptionLabel),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: CREATE_CATEGORY_COPY.submitButton }),
    ).toBeDefined();
  });

  it("displays an error message when error is provided", () => {
    const errorMessage = "Something went wrong.";
    render(
      <CreateCategoryFormView
        name=""
        onNameChange={vi.fn()}
        description=""
        onDescriptionChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={false}
        error={errorMessage}
      />,
    );

    expect(screen.getByText(errorMessage)).toBeDefined();
  });

  it("disables the submit button when loading", () => {
    render(
      <CreateCategoryFormView
        name=""
        onNameChange={vi.fn()}
        description=""
        onDescriptionChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={true}
        error={undefined}
      />,
    );

    const button = screen.getByRole("button", {
      name: CREATE_CATEGORY_COPY.submitButton,
    });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it("calls onNameChange when the name input value changes", () => {
    const onNameChange = vi.fn();
    render(
      <CreateCategoryFormView
        name=""
        onNameChange={onNameChange}
        description=""
        onDescriptionChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={false}
        error={undefined}
      />,
    );

    const input = screen.getByLabelText(CREATE_CATEGORY_COPY.nameLabel);
    fireEvent.change(input, { target: { value: "Best Movies" } });
    expect(onNameChange).toHaveBeenCalledWith("Best Movies");
  });

  it("calls onDescriptionChange when the description input value changes", () => {
    const onDescriptionChange = vi.fn();
    render(
      <CreateCategoryFormView
        name=""
        onNameChange={vi.fn()}
        description=""
        onDescriptionChange={onDescriptionChange}
        onSubmit={vi.fn()}
        loading={false}
        error={undefined}
      />,
    );

    const textarea = screen.getByLabelText(
      CREATE_CATEGORY_COPY.descriptionLabel,
    );
    fireEvent.change(textarea, { target: { value: "A fun category" } });
    expect(onDescriptionChange).toHaveBeenCalledWith("A fun category");
  });

  it("calls onSubmit when the form is submitted", () => {
    const onSubmit = vi.fn();
    render(
      <CreateCategoryFormView
        name="Best Movies"
        onNameChange={vi.fn()}
        description=""
        onDescriptionChange={vi.fn()}
        onSubmit={onSubmit}
        loading={false}
        error={undefined}
      />,
    );

    fireEvent.submit(screen.getByRole("form"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
