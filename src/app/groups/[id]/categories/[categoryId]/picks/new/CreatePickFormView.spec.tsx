import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RankingMode } from "@/lib/types/pick";

import { CREATE_PICK_COPY } from "./copy";
import { CreatePickFormView } from "./CreatePickFormView";

afterEach(cleanup);

describe("CreatePickFormView", () => {
  const defaultProps = {
    title: "",
    onTitleChange: vi.fn(),
    description: "",
    onDescriptionChange: vi.fn(),
    topCount: 3,
    onTopCountChange: vi.fn(),
    dueDate: "",
    onDueDateChange: vi.fn(),
    rankingMode: RankingMode.TierBuckets,
    onRankingModeChange: vi.fn(),
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

    it("renders the description textarea", () => {
      render(<CreatePickFormView {...defaultProps} />);
      expect(
        screen.getByLabelText(CREATE_PICK_COPY.descriptionLabel),
      ).toBeDefined();
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

    it("calls onDescriptionChange when description textarea changes", () => {
      const onDescriptionChange = vi.fn();
      render(
        <CreatePickFormView
          {...defaultProps}
          onDescriptionChange={onDescriptionChange}
        />,
      );
      fireEvent.change(
        screen.getByLabelText(CREATE_PICK_COPY.descriptionLabel),
        { target: { value: "A great pick" } },
      );
      expect(onDescriptionChange).toHaveBeenCalledWith("A great pick");
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

    it("does not call onTopCountChange when topCount input is cleared", () => {
      const onTopCountChange = vi.fn();
      render(
        <CreatePickFormView
          {...defaultProps}
          onTopCountChange={onTopCountChange}
        />,
      );
      fireEvent.change(screen.getByLabelText(CREATE_PICK_COPY.topCountLabel), {
        target: { value: "" },
      });
      expect(onTopCountChange).not.toHaveBeenCalled();
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
      const button = screen.getByRole<HTMLButtonElement>("button", {
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

  describe("ranking mode selector", () => {
    it("renders the ranking mode section label", () => {
      render(<CreatePickFormView {...defaultProps} />);
      expect(screen.getByText(CREATE_PICK_COPY.rankingModeLabel)).toBeDefined();
    });

    it("renders the Tier Buckets option as enabled", () => {
      render(<CreatePickFormView {...defaultProps} />);
      const tierBucketsButton = screen.getByRole("radio", {
        name: CREATE_PICK_COPY.rankingModes.tierBuckets,
      });
      expect(tierBucketsButton.hasAttribute("disabled")).toBe(false);
    });

    it("renders the Stack Rank option as disabled", () => {
      render(<CreatePickFormView {...defaultProps} />);
      const stackRankButton = screen.getByRole("radio", {
        name: new RegExp(CREATE_PICK_COPY.rankingModes.stackRank),
      });
      expect(stackRankButton.hasAttribute("disabled")).toBe(true);
    });

    it("renders the Head-to-Head option as disabled", () => {
      render(<CreatePickFormView {...defaultProps} />);
      const headToHeadButton = screen.getByRole("radio", {
        name: new RegExp(CREATE_PICK_COPY.rankingModes.headToHead),
      });
      expect(headToHeadButton.hasAttribute("disabled")).toBe(true);
    });

    it("calls onRankingModeChange when Tier Buckets is selected", () => {
      const onRankingModeChange = vi.fn();
      // Render with a non-TierBuckets mode so the TierBuckets radio is unchecked
      // and clicking it fires onChange
      render(
        <CreatePickFormView
          {...defaultProps}
          rankingMode={RankingMode.StackRank}
          onRankingModeChange={onRankingModeChange}
        />,
      );
      fireEvent.click(
        screen.getByRole("radio", {
          name: CREATE_PICK_COPY.rankingModes.tierBuckets,
        }),
      );
      expect(onRankingModeChange).toHaveBeenCalledWith(RankingMode.TierBuckets);
    });
  });
});
