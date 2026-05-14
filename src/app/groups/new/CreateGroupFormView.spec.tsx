import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { CreateGroupFormView } from "./CreateGroupFormView";
import { CREATE_GROUP_COPY } from "./copy";

afterEach(cleanup);

function renderView(
  overrides?: Partial<Parameters<typeof CreateGroupFormView>[0]>,
) {
  const defaults = {
    name: "",
    onNameChange: vi.fn(),
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    loading: false,
    error: undefined,
  };
  return render(<CreateGroupFormView {...defaults} {...overrides} />);
}

describe("page structure", () => {
  it("renders the title", () => {
    renderView();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      CREATE_GROUP_COPY.title,
    );
  });

  it("renders the emoji picker placeholder", () => {
    renderView();
    expect(
      screen.getByRole("button", { name: CREATE_GROUP_COPY.emojiPickerLabel }),
    ).toBeDefined();
  });
});

describe("name field", () => {
  it("renders the group name input", () => {
    renderView();
    expect(screen.getByLabelText(CREATE_GROUP_COPY.nameLabel)).toBeDefined();
  });

  it("reflects the name prop in the input", () => {
    renderView({ name: "Friday Night" });
    const input = screen.getByLabelText<HTMLInputElement>(
      CREATE_GROUP_COPY.nameLabel,
    );
    expect(input.value).toBe("Friday Night");
  });

  it("calls onNameChange when the input value changes", () => {
    const onNameChange = vi.fn();
    renderView({ onNameChange });
    fireEvent.change(screen.getByLabelText(CREATE_GROUP_COPY.nameLabel), {
      target: { value: "My Group" },
    });
    expect(onNameChange).toHaveBeenCalledWith("My Group");
  });
});

describe("submit button", () => {
  it("renders the submit button", () => {
    renderView();
    expect(
      screen.getByRole("button", { name: CREATE_GROUP_COPY.submitButton }),
    ).toBeDefined();
  });

  it("disables the submit button when loading", () => {
    renderView({ loading: true });
    const button = screen.getByRole<HTMLButtonElement>("button", {
      name: CREATE_GROUP_COPY.submitButton,
    });
    expect(button.disabled).toBe(true);
  });

  it("calls onSubmit when the form is submitted", () => {
    const onSubmit = vi.fn();
    renderView({ onSubmit, name: "My Group" });
    fireEvent.submit(screen.getByRole("form"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe("cancel button", () => {
  it("renders the cancel button", () => {
    renderView();
    expect(
      screen.getByRole("button", { name: CREATE_GROUP_COPY.cancelButton }),
    ).toBeDefined();
  });

  it("calls onCancel when the cancel button is clicked", () => {
    const onCancel = vi.fn();
    renderView({ onCancel });
    fireEvent.click(
      screen.getByRole("button", { name: CREATE_GROUP_COPY.cancelButton }),
    );
    expect(onCancel).toHaveBeenCalledOnce();
  });
});

describe("error display", () => {
  it("displays an error message when error is provided", () => {
    renderView({ error: CREATE_GROUP_COPY.errors.default });
    expect(screen.getByText(CREATE_GROUP_COPY.errors.default)).toBeDefined();
  });

  it("does not display an error message when error is undefined", () => {
    renderView({ error: undefined });
    expect(screen.queryByText(CREATE_GROUP_COPY.errors.default)).toBeNull();
  });
});
