import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { OptionListView } from "./OptionListView";
import { OPTION_LIST_COPY } from "./copy";
import type { PickOption } from "@/lib/types/option";

afterEach(cleanup);

function makePickOption(overrides?: Partial<PickOption>): PickOption {
  return {
    id: "opt-1",
    name: "Pizza",
    creatorId: "user-1",
    owners: ["user-1"],
    createdAt: new Date("2025-01-01"),
    pickId: "pick-1",
    categoryId: "cat-1",
    interestedCount: 0,
    ...overrides,
  };
}

const defaultProps = {
  options: [],
  newOptionName: "",
  loading: false,
  error: undefined,
  interestedOptionIds: [],
  onNewOptionNameChange: () => undefined,
  onSuggest: () => undefined,
  onToggleInterest: () => undefined,
};

describe("OptionListView", () => {
  it("renders each option name", () => {
    const options = [
      makePickOption({ id: "opt-1", name: "Pizza" }),
      makePickOption({ id: "opt-2", name: "Sushi" }),
    ];

    render(<OptionListView {...defaultProps} options={options} />);

    expect(screen.getByText("Pizza")).toBeDefined();
    expect(screen.getByText("Sushi")).toBeDefined();
  });

  it("renders the interest count for a single option", () => {
    const options = [makePickOption({ interestedCount: 1 })];

    render(<OptionListView {...defaultProps} options={options} />);

    expect(screen.getByText(OPTION_LIST_COPY.interestCount(1))).toBeDefined();
  });

  it("renders zero interest count when no one is interested", () => {
    const options = [makePickOption({ interestedCount: 0 })];

    render(<OptionListView {...defaultProps} options={options} />);

    expect(screen.getByText(OPTION_LIST_COPY.interestCount(0))).toBeDefined();
  });

  it("renders the suggest buttons", () => {
    render(<OptionListView {...defaultProps} />);

    const buttons = screen.getAllByText(OPTION_LIST_COPY.suggestButton);
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("calls onSuggest on form submit", () => {
    let submitted = false;

    render(
      <OptionListView
        {...defaultProps}
        onSuggest={() => {
          submitted = true;
        }}
      />,
    );

    fireEvent.submit(
      screen.getByRole("form", { name: OPTION_LIST_COPY.suggestFormLabel }),
    );
    expect(submitted).toBe(true);
  });

  it("calls onNewOptionNameChange on input change", () => {
    let changed = "";

    render(
      <OptionListView
        {...defaultProps}
        onNewOptionNameChange={(name) => {
          changed = name;
        }}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText(OPTION_LIST_COPY.suggestPlaceholder),
      { target: { value: "Tacos" } },
    );
    expect(changed).toBe("Tacos");
  });

  it("disables the form submit button while loading", () => {
    render(<OptionListView {...defaultProps} loading={true} />);

    // The form's submit button is type="submit"
    const submitButton = screen
      .getByRole("form")
      .querySelector('button[type="submit"]');
    expect(submitButton).toBeDefined();
    expect(submitButton?.getAttribute("disabled")).toBeDefined();
  });

  it("shows error message when error is set", () => {
    render(
      <OptionListView
        {...defaultProps}
        error={OPTION_LIST_COPY.errors.default}
      />,
    );

    expect(screen.getByText(OPTION_LIST_COPY.errors.default)).toBeDefined();
  });

  it("renders a heart button for each option", () => {
    const options = [
      makePickOption({ id: "opt-1", name: "Pizza" }),
      makePickOption({ id: "opt-2", name: "Sushi" }),
    ];

    render(<OptionListView {...defaultProps} options={options} />);

    const heartButtons = screen.getAllByRole("button", {
      name: OPTION_LIST_COPY.heart.markInterested,
    });
    expect(heartButtons).toHaveLength(2);
  });

  it("renders the interest count for each option", () => {
    const options = [
      makePickOption({ id: "opt-1", name: "Pizza", interestedCount: 1 }),
      makePickOption({ id: "opt-2", name: "Sushi", interestedCount: 0 }),
    ];

    render(<OptionListView {...defaultProps} options={options} />);

    expect(screen.getByText(OPTION_LIST_COPY.interestCount(1))).toBeDefined();
    expect(screen.getAllByText(OPTION_LIST_COPY.interestCount(0))).toHaveLength(
      1,
    );
  });

  it("calls onToggleInterest when a heart button is clicked", () => {
    let toggledId = "";
    const options = [makePickOption({ id: "opt-42", name: "Pizza" })];

    render(
      <OptionListView
        {...defaultProps}
        options={options}
        onToggleInterest={(id) => {
          toggledId = id;
        }}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: OPTION_LIST_COPY.heart.markInterested,
      }),
    );
    expect(toggledId).toBe("opt-42");
  });

  it("disables heart buttons when pickClosed is true", () => {
    const options = [makePickOption({ id: "opt-1", name: "Pizza" })];

    render(
      <OptionListView {...defaultProps} options={options} pickClosed={true} />,
    );

    const button = screen.getByRole("button", {
      name: OPTION_LIST_COPY.heart.markInterested,
    });
    expect(button.getAttribute("disabled")).toBeDefined();
  });

  it("renders heart button as interested when optionId is in interestedOptionIds", () => {
    const options = [makePickOption({ id: "opt-1", name: "Pizza" })];

    render(
      <OptionListView
        {...defaultProps}
        options={options}
        interestedOptionIds={["opt-1"]}
      />,
    );

    const button = screen.getByRole("button", {
      name: OPTION_LIST_COPY.heart.removeInterest,
    });
    expect(button).toBeDefined();
  });
});
