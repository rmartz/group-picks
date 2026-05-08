import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { OptionListView } from "./OptionListView";
import { PICK_DETAIL_COPY } from "./copy";
import type { Option } from "@/lib/types/option";

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

describe("OptionListView", () => {
  it("renders the options heading", () => {
    render(
      <OptionListView
        options={[]}
        suggestions={[]}
        newTitle=""
        loading={false}
        error={undefined}
        onNewTitleChange={() => undefined}
        onAddSubmit={() => undefined}
        onAdoptSuggestion={() => undefined}
      />,
    );

    expect(screen.getByText(PICK_DETAIL_COPY.optionsHeading)).toBeDefined();
  });

  it("renders the empty state when no options", () => {
    render(
      <OptionListView
        options={[]}
        suggestions={[]}
        newTitle=""
        loading={false}
        error={undefined}
        onNewTitleChange={() => undefined}
        onAddSubmit={() => undefined}
        onAdoptSuggestion={() => undefined}
      />,
    );

    expect(screen.getByText(PICK_DETAIL_COPY.noOptionsMessage)).toBeDefined();
  });

  it("renders option titles when options are provided", () => {
    const option = makeOption({ title: "Inception" });
    render(
      <OptionListView
        options={[option]}
        suggestions={[]}
        newTitle=""
        loading={false}
        error={undefined}
        onNewTitleChange={() => undefined}
        onAddSubmit={() => undefined}
        onAdoptSuggestion={() => undefined}
      />,
    );

    expect(screen.getByText("Inception")).toBeDefined();
  });

  it("does not render empty state when options are present", () => {
    const option = makeOption();
    render(
      <OptionListView
        options={[option]}
        suggestions={[]}
        newTitle=""
        loading={false}
        error={undefined}
        onNewTitleChange={() => undefined}
        onAddSubmit={() => undefined}
        onAdoptSuggestion={() => undefined}
      />,
    );

    expect(screen.queryByText(PICK_DETAIL_COPY.noOptionsMessage)).toBeNull();
  });

  it("renders multiple options", () => {
    const options = [
      makeOption({ id: "opt-1", title: "Movie One" }),
      makeOption({ id: "opt-2", title: "Movie Two" }),
    ];
    render(
      <OptionListView
        options={options}
        suggestions={[]}
        newTitle=""
        loading={false}
        error={undefined}
        onNewTitleChange={() => undefined}
        onAddSubmit={() => undefined}
        onAdoptSuggestion={() => undefined}
      />,
    );

    expect(screen.getByText("Movie One")).toBeDefined();
    expect(screen.getByText("Movie Two")).toBeDefined();
  });

  it("does not render suggestions section when suggestions are empty", () => {
    render(
      <OptionListView
        options={[]}
        suggestions={[]}
        newTitle=""
        loading={false}
        error={undefined}
        onNewTitleChange={() => undefined}
        onAddSubmit={() => undefined}
        onAdoptSuggestion={() => undefined}
      />,
    );

    expect(screen.queryByText(PICK_DETAIL_COPY.suggestionsHeading)).toBeNull();
  });

  it("renders suggestions section when suggestions are present", () => {
    const suggestion = makeOption({ id: "sug-1", title: "The Matrix" });
    render(
      <OptionListView
        options={[]}
        suggestions={[suggestion]}
        newTitle=""
        loading={false}
        error={undefined}
        onNewTitleChange={() => undefined}
        onAddSubmit={() => undefined}
        onAdoptSuggestion={() => undefined}
      />,
    );

    expect(screen.getByText(PICK_DETAIL_COPY.suggestionsHeading)).toBeDefined();
    expect(screen.getByText("The Matrix")).toBeDefined();
  });

  it("calls onAdoptSuggestion with the suggestion when adopt button is clicked", () => {
    const suggestion = makeOption({ id: "sug-1", title: "The Matrix" });
    let adopted: Option | undefined;

    render(
      <OptionListView
        options={[]}
        suggestions={[suggestion]}
        newTitle=""
        loading={false}
        error={undefined}
        onNewTitleChange={() => undefined}
        onAddSubmit={() => undefined}
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
    render(
      <OptionListView
        options={[]}
        suggestions={[]}
        newTitle="Interstellar"
        loading={false}
        error={undefined}
        onNewTitleChange={() => undefined}
        onAddSubmit={() => undefined}
        onAdoptSuggestion={() => undefined}
      />,
    );

    const input = screen.getByPlaceholderText(
      PICK_DETAIL_COPY.addOptionPlaceholder,
    );
    expect((input as HTMLInputElement).value).toBe("Interstellar");
  });

  it("calls onNewTitleChange when typing in the input", () => {
    let changedValue = "";

    render(
      <OptionListView
        options={[]}
        suggestions={[]}
        newTitle=""
        loading={false}
        error={undefined}
        onNewTitleChange={(v) => {
          changedValue = v;
        }}
        onAddSubmit={() => undefined}
        onAdoptSuggestion={() => undefined}
      />,
    );

    const input = screen.getByPlaceholderText(
      PICK_DETAIL_COPY.addOptionPlaceholder,
    );
    fireEvent.change(input, { target: { value: "Interstellar" } });

    expect(changedValue).toBe("Interstellar");
  });

  it("calls onAddSubmit when add button is clicked", () => {
    let submitted = false;

    render(
      <OptionListView
        options={[]}
        suggestions={[]}
        newTitle="Interstellar"
        loading={false}
        error={undefined}
        onNewTitleChange={() => undefined}
        onAddSubmit={() => {
          submitted = true;
        }}
        onAdoptSuggestion={() => undefined}
      />,
    );

    fireEvent.click(screen.getByText(PICK_DETAIL_COPY.addOptionButton));

    expect(submitted).toBe(true);
  });

  it("renders an error message when error is provided", () => {
    render(
      <OptionListView
        options={[]}
        suggestions={[]}
        newTitle=""
        loading={false}
        error="Something went wrong"
        onNewTitleChange={() => undefined}
        onAddSubmit={() => undefined}
        onAdoptSuggestion={() => undefined}
      />,
    );

    expect(screen.getByText("Something went wrong")).toBeDefined();
  });

  it("disables the add button when loading", () => {
    render(
      <OptionListView
        options={[]}
        suggestions={[]}
        newTitle="Interstellar"
        loading={true}
        error={undefined}
        onNewTitleChange={() => undefined}
        onAddSubmit={() => undefined}
        onAdoptSuggestion={() => undefined}
      />,
    );

    const addButton = screen.getByText(PICK_DETAIL_COPY.addOptionButton);
    expect((addButton as HTMLButtonElement).disabled).toBe(true);
  });

  it("disables adopt buttons when loading", () => {
    const suggestion = makeOption({ id: "sug-1", title: "The Matrix" });

    render(
      <OptionListView
        options={[]}
        suggestions={[suggestion]}
        newTitle=""
        loading={true}
        error={undefined}
        onNewTitleChange={() => undefined}
        onAddSubmit={() => undefined}
        onAdoptSuggestion={() => undefined}
      />,
    );

    const [adoptButton] = screen.getAllByText(PICK_DETAIL_COPY.adoptButton);
    expect((adoptButton as HTMLButtonElement).disabled).toBe(true);
  });
});
