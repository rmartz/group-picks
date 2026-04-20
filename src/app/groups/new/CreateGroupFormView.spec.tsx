import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { CreateGroupFormView } from "./CreateGroupFormView";
import { CREATE_GROUP_COPY } from "./copy";

afterEach(cleanup);

describe("CreateGroupFormView", () => {
  it("renders the title and form fields", () => {
    render(
      <CreateGroupFormView
        name=""
        onNameChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={false}
        error={undefined}
      />,
    );

    expect(screen.getByText(CREATE_GROUP_COPY.title)).toBeDefined();
    expect(screen.getByLabelText(CREATE_GROUP_COPY.nameLabel)).toBeDefined();
    expect(
      screen.getByRole("button", { name: CREATE_GROUP_COPY.submitButton }),
    ).toBeDefined();
  });

  it("displays an error message when error is provided", () => {
    const errorMessage = "Something went wrong.";
    render(
      <CreateGroupFormView
        name=""
        onNameChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={false}
        error={errorMessage}
      />,
    );

    expect(screen.getByText(errorMessage)).toBeDefined();
  });

  it("disables the submit button when loading", () => {
    render(
      <CreateGroupFormView
        name=""
        onNameChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={true}
        error={undefined}
      />,
    );

    const button = screen.getByRole("button", {
      name: CREATE_GROUP_COPY.submitButton,
    });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it("calls onNameChange when the input value changes", () => {
    const onNameChange = vi.fn();
    render(
      <CreateGroupFormView
        name=""
        onNameChange={onNameChange}
        onSubmit={vi.fn()}
        loading={false}
        error={undefined}
      />,
    );

    const input = screen.getByLabelText(CREATE_GROUP_COPY.nameLabel);
    fireEvent.change(input, { target: { value: "My Group" } });
    expect(onNameChange).toHaveBeenCalledWith("My Group");
  });

  it("calls onSubmit when the form is submitted", () => {
    const onSubmit = vi.fn();
    render(
      <CreateGroupFormView
        name="My Group"
        onNameChange={vi.fn()}
        onSubmit={onSubmit}
        loading={false}
        error={undefined}
      />,
    );

    fireEvent.submit(screen.getByRole("form"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
