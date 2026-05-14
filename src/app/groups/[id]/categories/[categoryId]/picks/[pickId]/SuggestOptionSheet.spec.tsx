import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { SuggestOptionSheet } from "./SuggestOptionSheet";
import { SUGGEST_OPTION_SHEET_COPY } from "./SuggestOptionSheet.copy";

const { mockAdoptOption } = vi.hoisted(() => ({
  mockAdoptOption: vi.fn(),
}));

vi.mock("@/services/options", () => ({
  adoptOption: mockAdoptOption,
}));

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (open ? <div>{children}</div> : null),
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const baseProps = {
  open: true,
  onOpenChange: vi.fn(),
  groupId: "group-1",
  categoryId: "cat-1",
  pickId: "pick-1",
  onOptionAdded: vi.fn(),
};

function renderSheet(
  overrides?: Partial<Parameters<typeof SuggestOptionSheet>[0]>,
) {
  return render(<SuggestOptionSheet {...baseProps} {...overrides} />);
}

describe("successful submission", () => {
  it("calls onOptionAdded with optionId and title on success", async () => {
    mockAdoptOption.mockResolvedValue({ optionId: "opt-99" });
    const onOptionAdded = vi.fn();
    renderSheet({ onOptionAdded });

    fireEvent.change(
      screen.getByLabelText(SUGGEST_OPTION_SHEET_COPY.titleLabel),
      { target: { value: "Inception" } },
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: SUGGEST_OPTION_SHEET_COPY.suggestButton,
      }),
    );

    await waitFor(() => {
      expect(onOptionAdded).toHaveBeenCalledWith({
        optionId: "opt-99",
        title: "Inception",
      });
    });
  });

  it("calls onOpenChange(false) after a successful submission", async () => {
    mockAdoptOption.mockResolvedValue({ optionId: "opt-99" });
    const onOpenChange = vi.fn();
    renderSheet({ onOpenChange });

    fireEvent.change(
      screen.getByLabelText(SUGGEST_OPTION_SHEET_COPY.titleLabel),
      { target: { value: "Inception" } },
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: SUGGEST_OPTION_SHEET_COPY.suggestButton,
      }),
    );

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});

describe("error handling", () => {
  it("shows the default error message when adoptOption rejects", async () => {
    mockAdoptOption.mockRejectedValue(new Error("network error"));
    renderSheet();

    fireEvent.change(
      screen.getByLabelText(SUGGEST_OPTION_SHEET_COPY.titleLabel),
      { target: { value: "Inception" } },
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: SUGGEST_OPTION_SHEET_COPY.suggestButton,
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(SUGGEST_OPTION_SHEET_COPY.errors.default),
      ).toBeDefined();
    });
  });

  it("does not call onOpenChange when adoptOption rejects", async () => {
    mockAdoptOption.mockRejectedValue(new Error("network error"));
    const onOpenChange = vi.fn();
    renderSheet({ onOpenChange });

    fireEvent.change(
      screen.getByLabelText(SUGGEST_OPTION_SHEET_COPY.titleLabel),
      { target: { value: "Inception" } },
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: SUGGEST_OPTION_SHEET_COPY.suggestButton,
      }),
    );

    await waitFor(() => {
      expect(mockAdoptOption).toHaveBeenCalled();
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe("empty title validation", () => {
  it("shows a required-title error when submitting with an empty title", () => {
    renderSheet();

    fireEvent.submit(
      screen
        .getByLabelText(SUGGEST_OPTION_SHEET_COPY.titleLabel)
        .closest("form")!,
    );

    expect(
      screen.getByText(SUGGEST_OPTION_SHEET_COPY.errors.titleRequired),
    ).toBeDefined();
    expect(mockAdoptOption).not.toHaveBeenCalled();
  });

  it("disables the suggest button when title is empty", () => {
    renderSheet();

    const button = screen.getByRole<HTMLButtonElement>("button", {
      name: SUGGEST_OPTION_SHEET_COPY.suggestButton,
    });
    expect(button.disabled).toBe(true);
  });
});

describe("cancel behaviour", () => {
  it("calls onOpenChange(false) when cancel is clicked", () => {
    const onOpenChange = vi.fn();
    renderSheet({ onOpenChange });

    fireEvent.click(
      screen.getByRole("button", {
        name: SUGGEST_OPTION_SHEET_COPY.cancelButton,
      }),
    );

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not call onOpenChange while loading", async () => {
    let resolveAdopt!: (value: { optionId: string }) => void;
    mockAdoptOption.mockReturnValue(
      new Promise<{ optionId: string }>((resolve) => {
        resolveAdopt = resolve;
      }),
    );
    const onOpenChange = vi.fn();
    renderSheet({ onOpenChange });

    fireEvent.change(
      screen.getByLabelText(SUGGEST_OPTION_SHEET_COPY.titleLabel),
      { target: { value: "Inception" } },
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: SUGGEST_OPTION_SHEET_COPY.suggestButton,
      }),
    );

    // Cancel is disabled while loading, but even if invoked it should be blocked
    fireEvent.click(
      screen.getByRole("button", {
        name: SUGGEST_OPTION_SHEET_COPY.cancelButton,
      }),
    );

    expect(onOpenChange).not.toHaveBeenCalled();

    resolveAdopt({ optionId: "opt-1" });
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
