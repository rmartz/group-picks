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
    ...overrides,
  };
}

const defaultProps = {
  options: [],
  newOptionName: "",
  loading: false,
  error: undefined,
  onNewOptionNameChange: () => undefined,
  onSuggest: () => undefined,
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

  it("renders owner count as '1 member' for a single owner", () => {
    const options = [makePickOption({ owners: ["user-1"] })];

    render(<OptionListView {...defaultProps} options={options} />);

    expect(screen.getByText(OPTION_LIST_COPY.ownerCount.one)).toBeDefined();
  });

  it("renders owner count as 'N members' for multiple owners", () => {
    const options = [makePickOption({ owners: ["user-1", "user-2"] })];

    render(<OptionListView {...defaultProps} options={options} />);

    expect(
      screen.getByText(OPTION_LIST_COPY.ownerCount.other(2)),
    ).toBeDefined();
  });

  it("renders the suggest button", () => {
    render(<OptionListView {...defaultProps} />);

    expect(screen.getByText(OPTION_LIST_COPY.suggestButton)).toBeDefined();
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

  it("disables the button while loading", () => {
    render(<OptionListView {...defaultProps} loading={true} />);

    const button = screen.getByText(OPTION_LIST_COPY.suggestButton);
    expect((button as HTMLButtonElement).disabled).toBe(true);
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
});
