import { describe, it, expect } from "vitest";
import {
  pickToFirebase,
  firebaseToPick,
  removeOwnerFromPickOption,
  type FirebasePickPublic,
} from "./pick";

const FIXED_DATE = new Date("2025-01-15T12:00:00.000Z");
const FIXED_TIMESTAMP = FIXED_DATE.getTime();

function makeFirebasePickPublic(
  overrides?: Partial<FirebasePickPublic>,
): FirebasePickPublic {
  return {
    title: "The Shawshank Redemption",
    description: "A classic film about hope",
    categoryId: "cat-123",
    createdAt: FIXED_TIMESTAMP,
    creatorId: "user-123",
    ...overrides,
  };
}

describe("pickToFirebase", () => {
  it("converts a pick to Firebase format", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: "A classic film about hope",
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
    });

    expect(result.title).toBe("The Shawshank Redemption");
    expect(result.description).toBe("A classic film about hope");
    expect(result.categoryId).toBe("cat-abc");
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.creatorId).toBe("user-abc");
  });

  it("converts options and owner IDs to Firebase format", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: "A classic film about hope",
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      options: [
        {
          id: "option-a",
          ownerIds: ["user-abc", "user-def"],
          title: "Movie night",
        },
      ],
    });

    expect(result.options).toEqual({
      "option-a": {
        ownerIds: ["user-abc", "user-def"],
        title: "Movie night",
      },
    });
  });

  it("omits description when it is undefined", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: undefined,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      options: undefined,
    });

    expect(result.description).toBeUndefined();
  });
});

describe("firebaseToPick", () => {
  it("converts Firebase data to a GroupPick", () => {
    const data = makeFirebasePickPublic();

    const result = firebaseToPick("pick-xyz", data);

    expect(result.id).toBe("pick-xyz");
    expect(result.title).toBe("The Shawshank Redemption");
    expect(result.description).toBe("A classic film about hope");
    expect(result.categoryId).toBe("cat-123");
    expect(result.createdAt).toEqual(FIXED_DATE);
    expect(result.creatorId).toBe("user-123");
  });

  it("returns undefined description when absent from Firebase data", () => {
    const data = makeFirebasePickPublic({ description: undefined });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.description).toBeUndefined();
  });

  it("converts Firebase options to pick options", () => {
    const data = makeFirebasePickPublic({
      options: {
        "option-a": {
          ownerIds: ["user-123"],
          title: "Movie night",
        },
      },
    });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.options).toEqual([
      {
        id: "option-a",
        ownerIds: ["user-123"],
        title: "Movie night",
      },
    ]);
  });
});

describe("removeOwnerFromPickOption", () => {
  it("removes the owner from the option owner list", () => {
    const result = removeOwnerFromPickOption(
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
    const result = removeOwnerFromPickOption(
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
