import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { CreatePickFormView } from "./CreatePickFormView";
import { CREATE_PICK_COPY } from "./copy";

afterEach(cleanup);

describe("CreatePickFormView", () => {
  const defaultProps = {
    title: "",
    onTitleChange: vi.fn(),
    topCount: 3,
    onTopCountChange: vi.fn(),
    dueDate: "",
    onDueDateChange: vi.fn(),
    hasPriorPicks: false,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    loading: false,
    error: undefined,
  };

  describe("renders form fields", () => {
    it("renders the form title", () => {
      render(<CreatePickFormView {...defaultProps} />);
      expect(screen.getByText(CREATE_PICK_COPY.title)).toBeDefined();
    });

    it("renders the pick title input", () => {
      render(<CreatePickFormView {...defaultProps} />);
      expect(screen.getByLabelText(CREATE_PICK_COPY.titleLabel)).toBeDefined();
    });

    it("renders the top-N count input", () => {
      render(<CreatePickFormView {...defaultProps} />);
      expect(
        screen.getByLabelText(CREATE_PICK_COPY.topCountLabel),
      ).toBeDefined();
    });

    it("renders the due date input", () => {
      render(<CreatePickFormView {...defaultProps} />);
      expect(
        screen.getByLabelText(CREATE_PICK_COPY.dueDateLabel),
      ).toBeDefined();
    });

    it("renders the submit button", () => {
      render(<CreatePickFormView {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: CREATE_PICK_COPY.submitButton }),
      ).toBeDefined();
    });

    it("renders the cancel button", () => {
      render(<CreatePickFormView {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: CREATE_PICK_COPY.cancelButton }),
      ).toBeDefined();
    });
  });

  describe("prior-picks banner", () => {
    it("shows the prior-picks banner when hasPriorPicks is true", () => {
      render(<CreatePickFormView {...defaultProps} hasPriorPicks={true} />);
      expect(
        screen.getByText(CREATE_PICK_COPY.priorPicksBannerTitle),
      ).toBeDefined();
    });

    it("hides the prior-picks banner when hasPriorPicks is false", () => {
      render(<CreatePickFormView {...defaultProps} hasPriorPicks={false} />);
      expect(
        screen.queryByText(CREATE_PICK_COPY.priorPicksBannerTitle),
      ).toBeNull();
    });
  });

  describe("field interactions", () => {
    it("calls onTitleChange when title input changes", () => {
      const onTitleChange = vi.fn();
      render(
        <CreatePickFormView {...defaultProps} onTitleChange={onTitleChange} />,
      );
      fireEvent.change(screen.getByLabelText(CREATE_PICK_COPY.titleLabel), {
        target: { value: "Best Movies" },
      });
      expect(onTitleChange).toHaveBeenCalledWith("Best Movies");
    });

    it("calls onTopCountChange with a number when topCount input changes", () => {
      const onTopCountChange = vi.fn();
      render(
        <CreatePickFormView
          {...defaultProps}
          onTopCountChange={onTopCountChange}
        />,
      );
      fireEvent.change(screen.getByLabelText(CREATE_PICK_COPY.topCountLabel), {
        target: { value: "5" },
      });
      expect(onTopCountChange).toHaveBeenCalledWith(5);
    });

    it("calls onDueDateChange when due date input changes", () => {
      const onDueDateChange = vi.fn();
      render(
        <CreatePickFormView
          {...defaultProps}
          onDueDateChange={onDueDateChange}
        />,
      );
      fireEvent.change(screen.getByLabelText(CREATE_PICK_COPY.dueDateLabel), {
        target: { value: "2025-12-31" },
      });
      expect(onDueDateChange).toHaveBeenCalledWith("2025-12-31");
    });

    it("calls onSubmit when form is submitted", () => {
      const onSubmit = vi.fn();
      render(<CreatePickFormView {...defaultProps} onSubmit={onSubmit} />);
      fireEvent.submit(screen.getByRole("form"));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when cancel button is clicked", () => {
      const onCancel = vi.fn();
      render(<CreatePickFormView {...defaultProps} onCancel={onCancel} />);
      fireEvent.click(
        screen.getByRole("button", { name: CREATE_PICK_COPY.cancelButton }),
      );
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("loading state", () => {
    it("disables the submit button when loading", () => {
      render(<CreatePickFormView {...defaultProps} loading={true} />);
      const button = screen.getByRole("button", {
        name: CREATE_PICK_COPY.submitButton,
      });
      expect(button.disabled).toBe(true);
    });
  });

  describe("error state", () => {
    it("shows error message when error is provided", () => {
      const error = "Something went wrong.";
      render(<CreatePickFormView {...defaultProps} error={error} />);
      expect(screen.getByText(error)).toBeDefined();
    });
  });
});
