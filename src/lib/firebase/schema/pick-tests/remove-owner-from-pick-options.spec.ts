import { describe, expect, it } from "vitest";

import { removeOwnerFromPickOptions } from "../pick";

describe("removeOwnerFromPickOptions", () => {
  it("removes the owner from the option owner list", () => {
    const result = removeOwnerFromPickOptions(
      [
        {
          id: "option-a",
          ownerIds: ["user-123", "user-456"],
          title: "Movie night",
        },
      ],
      "option-a",
      "user-456",
    );

    expect(result).toEqual([
      {
        id: "option-a",
        ownerIds: ["user-123"],
        title: "Movie night",
      },
    ]);
  });

  it("deletes the option when no owners remain", () => {
    const result = removeOwnerFromPickOptions(
      [
        {
          id: "option-a",
          ownerIds: ["user-123"],
          title: "Movie night",
        },
      ],
      "option-a",
      "user-123",
    );

    expect(result).toEqual([]);
  });
});
