import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Option } from "@/lib/types/option";

import { PICK_DETAIL_COPY } from "./copy";
import { OptionList } from "./OptionList";

const { mockJoinOptionOwner, mockUnjoinOptionOwner, mockAdoptOption } =
  vi.hoisted(() => ({
    mockJoinOptionOwner: vi.fn(),
    mockUnjoinOptionOwner: vi.fn(),
    mockAdoptOption: vi.fn(),
  }));

vi.mock("@/services/options", () => ({
  joinOptionOwner: mockJoinOptionOwner,
  unjoinOptionOwner: mockUnjoinOptionOwner,
  adoptOption: mockAdoptOption,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function makeOption(overrides?: Partial<Option>): Option {
  return {
    id: "opt-1",
    title: "Pizza",
    pickId: "pick-1",
    ownerIds: ["user-2"],
    ...overrides,
  };
}

const baseProps = {
  groupId: "group-1",
  categoryId: "cat-1",
  pickId: "pick-1",
  currentUserId: "user-1",
  initialSuggestions: [],
  pickClosed: false,
};

describe("OptionList heart toggle", () => {
  it("optimistically adds the user to ownerIds when hearting", async () => {
    mockJoinOptionOwner.mockResolvedValue(undefined);
    const option = makeOption({ ownerIds: ["user-2"] });

    render(<OptionList {...baseProps} initialOptions={[option]} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: PICK_DETAIL_COPY.heart.addOwnership,
      }),
    );

    // The button immediately reflects the new state
    expect(
      screen.getByRole("button", {
        name: PICK_DETAIL_COPY.heart.removeOwnership,
      }),
    ).toBeDefined();
    await waitFor(() => {
      expect(mockJoinOptionOwner).toHaveBeenCalledWith(
        "group-1",
        "cat-1",
        "pick-1",
        "opt-1",
      );
    });
  });

  it("reverts the optimistic add when the request fails", async () => {
    mockJoinOptionOwner.mockRejectedValue(new Error("network"));
    const option = makeOption({ ownerIds: ["user-2"] });

    render(<OptionList {...baseProps} initialOptions={[option]} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: PICK_DETAIL_COPY.heart.addOwnership,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText(PICK_DETAIL_COPY.errors.default)).toBeDefined();
    });
    expect(
      screen.getByRole("button", {
        name: PICK_DETAIL_COPY.heart.addOwnership,
      }),
    ).toBeDefined();
  });

  it("optimistically removes the option when the last owner unhearts", async () => {
    mockUnjoinOptionOwner.mockResolvedValue({ deleted: true });
    const option = makeOption({ ownerIds: ["user-1"] });

    render(<OptionList {...baseProps} initialOptions={[option]} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: PICK_DETAIL_COPY.heart.removeOwnership,
      }),
    );

    expect(screen.queryByText("Pizza")).toBeNull();
    await waitFor(() => {
      expect(mockUnjoinOptionOwner).toHaveBeenCalledWith(
        "group-1",
        "cat-1",
        "pick-1",
        "opt-1",
      );
    });
  });

  it("restores the option after a failed unheart of the last owner", async () => {
    mockUnjoinOptionOwner.mockRejectedValue(new Error("network"));
    const option = makeOption({ ownerIds: ["user-1"] });

    render(<OptionList {...baseProps} initialOptions={[option]} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: PICK_DETAIL_COPY.heart.removeOwnership,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("Pizza")).toBeDefined();
    });
    expect(screen.getByText(PICK_DETAIL_COPY.errors.default)).toBeDefined();
  });

  it("does not fire toggle requests when the pick is closed", () => {
    const option = makeOption({ ownerIds: ["user-2"] });

    render(
      <OptionList {...baseProps} initialOptions={[option]} pickClosed={true} />,
    );

    const button = screen.getByRole("button", {
      name: new RegExp(PICK_DETAIL_COPY.heart.closed),
    });
    fireEvent.click(button);

    expect(mockJoinOptionOwner).not.toHaveBeenCalled();
    expect(mockUnjoinOptionOwner).not.toHaveBeenCalled();
  });

  it("hides the add-option form when the pick is closed", () => {
    render(<OptionList {...baseProps} initialOptions={[]} pickClosed={true} />);

    expect(
      screen.queryByPlaceholderText(PICK_DETAIL_COPY.addOptionPlaceholder),
    ).toBeNull();
  });
});
