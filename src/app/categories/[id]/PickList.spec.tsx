import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { GroupPick } from "@/lib/types/pick";
import { CATEGORY_DETAIL_COPY } from "./copy";
import { PickList } from "./PickList";
import { updatePick } from "@/services/picks";

vi.mock("@/services/picks", () => ({
  updatePick: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function makePick(overrides?: Partial<GroupPick>): GroupPick {
  return {
    id: "pick-1",
    title: "The Shawshank Redemption",
    description: "A classic film about hope",
    topCount: 3,
    dueDate: new Date("2025-02-01T12:00:00.000Z"),
    categoryId: "cat-1",
    createdAt: new Date("2025-01-20T12:00:00.000Z"),
    creatorId: "user-123",
    ...overrides,
  };
}

describe("PickList", () => {
  it("renders an edit button for each pick", () => {
    render(
      <PickList
        groupId="group-1"
        categoryId="cat-1"
        initialPicks={[makePick()]}
      />,
    );

    expect(screen.getByText(CATEGORY_DETAIL_COPY.editButton)).toBeDefined();
  });

  it("submits edited pick values", async () => {
    vi.mocked(updatePick).mockResolvedValue(undefined);

    render(
      <PickList
        groupId="group-1"
        categoryId="cat-1"
        initialPicks={[makePick()]}
      />,
    );

    fireEvent.click(screen.getByText(CATEGORY_DETAIL_COPY.editButton));

    fireEvent.change(
      screen.getByLabelText(CATEGORY_DETAIL_COPY.editForm.nameLabel),
      {
        target: { value: "The Godfather" },
      },
    );
    fireEvent.change(
      screen.getByLabelText(CATEGORY_DETAIL_COPY.editForm.descriptionLabel),
      {
        target: { value: "A mafia classic" },
      },
    );
    fireEvent.change(
      screen.getByLabelText(CATEGORY_DETAIL_COPY.editForm.topCountLabel),
      {
        target: { value: "5" },
      },
    );
    fireEvent.change(
      screen.getByLabelText(CATEGORY_DETAIL_COPY.editForm.dueDateLabel),
      {
        target: { value: "2025-03-10T18:45" },
      },
    );

    fireEvent.click(
      screen.getByText(CATEGORY_DETAIL_COPY.editForm.submitButton),
    );

    await waitFor(() => {
      expect(vi.mocked(updatePick)).toHaveBeenCalledOnce();
    });

    const firstCall = vi.mocked(updatePick).mock.calls[0]!;
    const [, , , title, description, topCount, dueDate] = firstCall;
    expect(title).toBe("The Godfather");
    expect(description).toBe("A mafia classic");
    expect(topCount).toBe(5);
    expect(dueDate!.toISOString()).toBe("2025-03-10T18:45:00.000Z");
  });
});
