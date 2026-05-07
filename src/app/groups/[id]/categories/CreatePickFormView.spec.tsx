import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CreatePickFormView } from "./CreatePickFormView";
import { CATEGORY_COPY } from "./copy";

afterEach(cleanup);

function makeProps() {
  return {
    categories: [
      {
        id: "cat-1",
        name: "Best Movies",
        description: "Vote on your favorite movies",
        groupId: "group-1",
        createdAt: new Date("2025-01-01T12:00:00.000Z"),
        creatorId: "user-1",
      },
      {
        id: "cat-2",
        name: "Top Albums",
        description: "Vote on your favorite albums",
        groupId: "group-1",
        createdAt: new Date("2025-01-02T12:00:00.000Z"),
        creatorId: "user-1",
      },
    ],
    categoryId: "cat-1",
    name: "",
    description: "",
    topCount: "3",
    dueDate: "",
    loading: false,
    error: undefined,
    onCategoryChange: vi.fn(),
    onNameChange: vi.fn(),
    onDescriptionChange: vi.fn(),
    onTopCountChange: vi.fn(),
    onDueDateChange: vi.fn(),
    onSubmit: vi.fn((e: React.SyntheticEvent) => {
      e.preventDefault();
    }),
    onCancel: vi.fn(),
  };
}

describe("CreatePickFormView", () => {
  it("renders required form labels", () => {
    const props = makeProps();
    render(<CreatePickFormView {...props} />);

    expect(
      screen.getByLabelText(CATEGORY_COPY.createPickForm.categoryLabel),
    ).toBeDefined();
    expect(
      screen.getByLabelText(CATEGORY_COPY.createPickForm.nameLabel),
    ).toBeDefined();
    expect(
      screen.getByLabelText(CATEGORY_COPY.createPickForm.topCountLabel),
    ).toBeDefined();
    expect(
      screen.getByLabelText(CATEGORY_COPY.createPickForm.dueDateLabel),
    ).toBeDefined();
  });

  it("calls input handlers on change", () => {
    const props = makeProps();
    render(<CreatePickFormView {...props} />);

    fireEvent.change(
      screen.getByLabelText(CATEGORY_COPY.createPickForm.categoryLabel),
      {
        target: { value: "cat-2" },
      },
    );
    fireEvent.change(
      screen.getByLabelText(CATEGORY_COPY.createPickForm.nameLabel),
      {
        target: { value: "Greatest Movie" },
      },
    );
    fireEvent.change(
      screen.getByLabelText(CATEGORY_COPY.createPickForm.descriptionLabel),
      { target: { value: "My pick description" } },
    );
    fireEvent.change(
      screen.getByLabelText(CATEGORY_COPY.createPickForm.topCountLabel),
      {
        target: { value: "5" },
      },
    );
    fireEvent.change(
      screen.getByLabelText(CATEGORY_COPY.createPickForm.dueDateLabel),
      {
        target: { value: "2026-01-20" },
      },
    );

    expect(props.onCategoryChange).toHaveBeenCalledWith("cat-2");
    expect(props.onNameChange).toHaveBeenCalledWith("Greatest Movie");
    expect(props.onDescriptionChange).toHaveBeenCalledWith(
      "My pick description",
    );
    expect(props.onTopCountChange).toHaveBeenCalledWith("5");
    expect(props.onDueDateChange).toHaveBeenCalledWith("2026-01-20");
  });

  it("submits and cancels", () => {
    const props = makeProps();
    render(<CreatePickFormView {...props} />);

    fireEvent.submit(screen.getByLabelText(CATEGORY_COPY.createPickForm.title));
    fireEvent.click(
      screen.getByText(CATEGORY_COPY.createPickForm.cancelButton),
    );

    expect(props.onSubmit).toHaveBeenCalled();
    expect(props.onCancel).toHaveBeenCalled();
  });
});
