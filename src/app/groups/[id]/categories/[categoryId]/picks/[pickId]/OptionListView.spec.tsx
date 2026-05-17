import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { Option } from "@/lib/types/option";

import { PICK_DETAIL_COPY } from "./copy";
import { OptionListView, type OptionListViewProps } from "./OptionListView";

// TODO: upgrade to userEvent when @testing-library/user-event is available

afterEach(cleanup);

function makeOption(overrides?: Partial<Option>): Option {
  return {
    id: "opt-1",
    title: "The Shawshank Redemption",
    pickId: "pick-1",
    ownerIds: ["user-1"],
    ...overrides,
  };
}

const defaultProps: OptionListViewProps = {
  options: [],
  suggestions: [],
  newTitle: "",
  loading: false,
  error: undefined,
  currentUserId: "user-1",
  pickClosed: false,
  onNewTitleChange: () => undefined,
  onAddSubmit: () => undefined,
  onAdoptSuggestion: () => undefined,
  onToggleOwner: () => undefined,
};

describe("OptionListView", () => {
  it("renders the options heading", () => {
    render(<OptionListView {...defaultProps} />);

    expect(screen.getByText(PICK_DETAIL_COPY.optionsHeading)).toBeDefined();
  });

  it("renders the empty state when no options", () => {
    render(<OptionListView {...defaultProps} />);

    expect(screen.getByText(PICK_DETAIL_COPY.noOptionsMessage)).toBeDefined();
  });

  it("renders option titles when options are provided", () => {
    const option = makeOption({ title: "Inception" });
    render(<OptionListView {...defaultProps} options={[option]} />);

    expect(screen.getByText("Inception")).toBeDefined();
  });

  it("does not render empty state when options are present", () => {
    render(<OptionListView {...defaultProps} options={[makeOption()]} />);

    expect(screen.queryByText(PICK_DETAIL_COPY.noOptionsMessage)).toBeNull();
  });

  it("renders multiple options", () => {
    const options = [
      makeOption({ id: "opt-1", title: "Movie One" }),
      makeOption({ id: "opt-2", title: "Movie Two" }),
    ];
    render(<OptionListView {...defaultProps} options={options} />);

    expect(screen.getByText("Movie One")).toBeDefined();
    expect(screen.getByText("Movie Two")).toBeDefined();
  });

  it("does not render suggestions section when suggestions are empty", () => {
    render(<OptionListView {...defaultProps} />);

    expect(screen.queryByText(PICK_DETAIL_COPY.suggestionsHeading)).toBeNull();
  });

  it("renders suggestions section when suggestions are present", () => {
    const suggestion = makeOption({ id: "sug-1", title: "The Matrix" });
    render(<OptionListView {...defaultProps} suggestions={[suggestion]} />);

    expect(screen.getByText(PICK_DETAIL_COPY.suggestionsHeading)).toBeDefined();
    expect(screen.getByText("The Matrix")).toBeDefined();
  });

  it("hides only the add form when hideAddForm is true", () => {
    const suggestion = makeOption({ id: "sug-1", title: "The Matrix" });

    render(
      <OptionListView
        {...defaultProps}
        suggestions={[suggestion]}
        hideAddForm
      />,
    );

    expect(
      screen.queryByPlaceholderText(PICK_DETAIL_COPY.addOptionPlaceholder),
    ).toBeNull();
    expect(screen.queryByText(PICK_DETAIL_COPY.addOptionButton)).toBeNull();
    expect(screen.getByText(PICK_DETAIL_COPY.suggestionsHeading)).toBeDefined();
    expect(screen.getByText("The Matrix")).toBeDefined();
  });

  it("calls onAdoptSuggestion with the suggestion when adopt button is clicked", () => {
    const suggestion = makeOption({ id: "sug-1", title: "The Matrix" });
    let adopted: Option | undefined;

    render(
      <OptionListView
        {...defaultProps}
        suggestions={[suggestion]}
        onAdoptSuggestion={(opt) => {
          adopted = opt;
        }}
      />,
    );

    const [adoptButton] = screen.getAllByText(PICK_DETAIL_COPY.adoptButton);
    fireEvent.click(adoptButton!);

    expect(adopted).toEqual(suggestion);
  });

  it("renders the add option input with the current newTitle value", () => {
    render(<OptionListView {...defaultProps} newTitle="Interstellar" />);

    const input = screen.getByPlaceholderText(
      PICK_DETAIL_COPY.addOptionPlaceholder,
    );
    expect((input as HTMLInputElement).value).toBe("Interstellar");
  });

  it("calls onNewTitleChange when typing in the input", () => {
    let changedValue = "";

    render(
      <OptionListView
        {...defaultProps}
        onNewTitleChange={(v) => {
          changedValue = v;
        }}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText(PICK_DETAIL_COPY.addOptionPlaceholder),
      { target: { value: "Interstellar" } },
    );

    expect(changedValue).toBe("Interstellar");
  });

  it("calls onAddSubmit when add button is clicked", () => {
    let submitted = false;

    render(
      <OptionListView
        {...defaultProps}
        newTitle="Interstellar"
        onAddSubmit={() => {
          submitted = true;
        }}
      />,
    );

    fireEvent.click(screen.getByText(PICK_DETAIL_COPY.addOptionButton));

    expect(submitted).toBe(true);
  });

  it("renders an error message when error is provided", () => {
    render(<OptionListView {...defaultProps} error="Something went wrong" />);

    expect(screen.getByText("Something went wrong")).toBeDefined();
  });

  it("disables the add button when loading", () => {
    render(
      <OptionListView
        {...defaultProps}
        newTitle="Interstellar"
        loading={true}
      />,
    );

    const addButton = screen.getByText(PICK_DETAIL_COPY.addOptionButton);
    expect((addButton as HTMLButtonElement).disabled).toBe(true);
  });

  it("disables adopt buttons when loading", () => {
    const suggestion = makeOption({ id: "sug-1", title: "The Matrix" });

    render(
      <OptionListView
        {...defaultProps}
        suggestions={[suggestion]}
        loading={true}
      />,
    );

    const [adoptButton] = screen.getAllByText(PICK_DETAIL_COPY.adoptButton);
    expect((adoptButton as HTMLButtonElement).disabled).toBe(true);
  });

  it("renders the heart as filled when the current user owns the option", () => {
    const option = makeOption({ ownerIds: ["user-1", "user-2"] });

    render(
      <OptionListView
        {...defaultProps}
        currentUserId="user-1"
        options={[option]}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: PICK_DETAIL_COPY.heart.removeOwnership,
      }),
    ).toBeDefined();
  });

  it("renders the heart as empty when the current user does not own the option", () => {
    const option = makeOption({ ownerIds: ["user-2"] });

    render(
      <OptionListView
        {...defaultProps}
        currentUserId="user-1"
        options={[option]}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: PICK_DETAIL_COPY.heart.addOwnership,
      }),
    ).toBeDefined();
  });

  it("calls onToggleOwner with the option when the heart is clicked", () => {
    const option = makeOption({ id: "opt-99", ownerIds: ["user-2"] });
    let toggled: Option | undefined;

    render(
      <OptionListView
        {...defaultProps}
        currentUserId="user-1"
        options={[option]}
        onToggleOwner={(o) => {
          toggled = o;
        }}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: PICK_DETAIL_COPY.heart.addOwnership,
      }),
    );

    expect(toggled).toEqual(option);
  });

  it("disables the heart button when loading", () => {
    const option = makeOption({ ownerIds: ["user-1"] });

    render(
      <OptionListView
        {...defaultProps}
        currentUserId="user-1"
        options={[option]}
        loading={true}
      />,
    );

    const button = screen.getByRole("button", {
      name: PICK_DETAIL_COPY.heart.removeOwnership,
    });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  describe("when the pick is closed", () => {
    it("renders the closed-pick notice", () => {
      render(<OptionListView {...defaultProps} pickClosed={true} />);

      expect(screen.getByText(PICK_DETAIL_COPY.closedNotice)).toBeDefined();
    });

    it("hides the add-option form", () => {
      render(<OptionListView {...defaultProps} pickClosed={true} />);

      expect(
        screen.queryByPlaceholderText(PICK_DETAIL_COPY.addOptionPlaceholder),
      ).toBeNull();
      expect(screen.queryByText(PICK_DETAIL_COPY.addOptionButton)).toBeNull();
    });

    it("hides the suggestions section even when suggestions are provided", () => {
      const suggestion = makeOption({ id: "sug-1", title: "The Matrix" });

      render(
        <OptionListView
          {...defaultProps}
          pickClosed={true}
          suggestions={[suggestion]}
        />,
      );

      expect(
        screen.queryByText(PICK_DETAIL_COPY.suggestionsHeading),
      ).toBeNull();
      expect(screen.queryByText("The Matrix")).toBeNull();
      expect(screen.queryByText(PICK_DETAIL_COPY.adoptButton)).toBeNull();
    });

    it("disables the heart button on each option", () => {
      const option = makeOption({ ownerIds: ["user-1"] });

      render(
        <OptionListView
          {...defaultProps}
          currentUserId="user-1"
          options={[option]}
          pickClosed={true}
        />,
      );

      const button = screen.getByRole("button", {
        name: new RegExp(PICK_DETAIL_COPY.heart.removeOwnership),
      });
      expect((button as HTMLButtonElement).disabled).toBe(true);
    });

    it("annotates the heart button aria-label with the closed hint", () => {
      const option = makeOption({ ownerIds: ["user-2"] });

      render(
        <OptionListView
          {...defaultProps}
          currentUserId="user-1"
          options={[option]}
          pickClosed={true}
        />,
      );

      const button = screen.getByRole("button", {
        name: new RegExp(PICK_DETAIL_COPY.heart.closed),
      });
      expect(button).toBeDefined();
    });

    it("still renders option titles", () => {
      const option = makeOption({ title: "Inception" });

      render(
        <OptionListView
          {...defaultProps}
          options={[option]}
          pickClosed={true}
        />,
      );

      expect(screen.getByText("Inception")).toBeDefined();
    });
  });
});
